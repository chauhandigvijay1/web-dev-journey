(function () {
  'use strict';

  // ─── Constants ──────────────────────────────────────────────────────────────
  var MAX_TEXT_LENGTH = 50000;
  var MAX_DESC_LENGTH = 4000;
  var SPA_WAIT_MAX = 3000;
  var SPA_WAIT_INTERVAL = 300;

  // ─── Generic Helpers ───────────────────────────────────────────────────────

  function clean(str) {
    return (str || '').trim().replace(/\s+/g, ' ');
  }

  function safeDecode(str) {
    try { return decodeURIComponent(str); } catch { return str; }
  }

  function qs(doc, sel) {
    try { return doc.querySelector(sel); } catch { return null; }
  }

  function qsa(doc, sel) {
    try { return Array.from(doc.querySelectorAll(sel)); } catch { return []; }
  }

  function attr(el, name) {
    return el ? (el.getAttribute(name) || '').trim() : '';
  }

  function text(el, max) {
    if (!el) return '';
    max = max || MAX_TEXT_LENGTH;
    var t = (el.innerText || el.textContent || '').trim().replace(/\s+/g, ' ');
    return t.slice(0, max);
  }

  function firstText(doc, selectors) {
    for (var i = 0; i < selectors.length; i++) {
      var el = qs(doc, selectors[i]);
      if (el) {
        var v = text(el);
        if (v) return v;
      }
    }
    return null;
  }

  function firstAttr(doc, selectors, attribute) {
    for (var i = 0; i < selectors.length; i++) {
      var el = qs(doc, selectors[i]);
      if (el) {
        var v = attr(el, attribute || 'href');
        if (v) return v;
      }
    }
    return null;
  }

  function findMeta(doc, prop) {
    return (
      attr(qs(doc, 'meta[property="' + prop + '"]'), 'content') ||
      attr(qs(doc, 'meta[name="' + prop + '"]'), 'content') ||
      ''
    );
  }

  function titleFromUrl() {
    var path = window.location.pathname;
    var segments = path.replace(/\/+$/, '').split('/').filter(Boolean);
    for (var i = segments.length - 1; i >= 0; i--) {
      var seg = safeDecode(segments[i])
        .replace(/[-_]/g, ' ')
        .replace(/\b(job|position|career|opening|vacancy|req|id)-\d+\b/gi, '')
        .replace(/\b\d{5,}\b/g, '')
        .trim();
      if (seg.length > 6 && seg.length < 150 && !/^\d+$/.test(seg)) {
        return seg
          .replace(/\b(job|position|hiring|career|opening|vacancy|view|posting)\b/gi, '')
          .trim();
      }
    }
    return '';
  }

  // ─── Safe Storage Wrapper ──────────────────────────────────────────────────

  var memoryStorage = new Map();

  function safeStorageGet(keys) {
    try {
      return Promise.resolve(chrome.storage.local.get(keys));
    } catch (e) {
      var result = {};
      var keyArr = Array.isArray(keys) ? keys : [keys];
      for (var i = 0; i < keyArr.length; i++) {
        var k = keyArr[i];
        if (typeof k === 'string') {
          result[k] = memoryStorage.get(k);
        }
      }
      return Promise.resolve(result);
    }
  }

  function safeStorageSet(items) {
    try {
      chrome.storage.local.set(items);
    } catch (e) {
      // in-memory fallback
    }
    for (var key in items) {
      if (Object.prototype.hasOwnProperty.call(items, key)) {
        memoryStorage.set(key, items[key]);
      }
    }
    return Promise.resolve();
  }

  // ─── LD+JSON Extractor ────────────────────────────────────────────────────

  function extractFromLdJson(doc) {
    var scripts = qsa(doc, 'script[type="application/ld+json"]');
    for (var i = 0; i < scripts.length; i++) {
      try {
        var raw = JSON.parse(scripts[i].textContent);
        var items = [];
        if (raw['@graph']) {
          items = Array.isArray(raw['@graph']) ? raw['@graph'] : [raw['@graph']];
        } else {
          items = Array.isArray(raw) ? raw : [raw];
        }
        for (var j = 0; j < items.length; j++) {
          var item = items[j];
          var types = Array.isArray(item['@type']) ? item['@type'] : [item['@type']];
          var isJob = types.some(function (t) {
            return t && typeof t === 'string' && t.indexOf('JobPosting') !== -1;
          });
          if (!isJob) continue;
          var loc = item.jobLocation;
          var address = loc ? loc.address : null;
          var hiringOrg = item.hiringOrganization;
          var result = {
            title: clean(item.title) || '',
            company: '',
            location: '',
            salary: '',
            jobType: '',
            description: '',
            skills: [],
            originalApplyLink: '',
            workMode: '',
          };
          if (hiringOrg) {
            result.company = clean(hiringOrg.name) || clean(hiringOrg['@id']) || '';
          }
          if (address) {
            result.location =
              clean(address.addressLocality) ||
              clean(address.addressRegion) ||
              clean(address.streetAddress) ||
              clean(address.addressCountry) ||
              '';
          }
          if (!result.location && loc) {
            result.location = clean(loc.name) || '';
          }
          result.description = clean(item.description) || '';
          result.jobType = clean(item.employmentType) || clean(item.employmentTypes) || '';
          var salary = item.baseSalary || item.salary;
          if (salary) {
            var currency = salary.currency || '';
            var minVal = salary.minValue || salary.value || '';
            var maxVal = salary.maxValue || '';
            if (minVal) {
              result.salary = (currency ? currency + ' ' : '') + minVal;
              if (maxVal) result.salary += ' - ' + maxVal;
            }
          }
          if (item.skills) {
            result.skills = Array.isArray(item.skills)
              ? item.skills.map(function (s) { return clean(String(s)); }).filter(Boolean)
              : [clean(String(item.skills))].filter(Boolean);
          }
          result.originalApplyLink =
            clean(item.directApply) || clean(item.url) || clean(item.sameAs) || '';
          result.workMode = detectWorkModeFromString(
            clean(item.jobLocationType) +
              ' ' +
              clean(item.employmentType) +
              ' ' +
              clean(item.description)
          );
          return result;
        }
      } catch (e) {
        // skip invalid JSON
      }
    }
    return null;
  }

  // ─── Microdata Extractor ────────────────────────────────────────────────────

  function extractFromMicrodata(doc) {
    var container = qs(
      doc,
      '[itemtype*="JobPosting"], [itemscope][itemtype*="JobPosting"]'
    );
    if (!container) return null;
    function g(sel) {
      return text(qs(container, sel));
    }
    var companyEl = qs(container, '[itemprop="hiringOrganization"] [itemprop="name"]');
    var locEl = qs(container, '[itemprop="jobLocation"] [itemprop="addressLocality"]');
    var salaryEl = qs(container, '[itemprop="baseSalary"] [itemprop="value"]');
    var salaryCurrency = attr(qs(container, '[itemprop="baseSalary"] [itemprop="currency"]'), 'content');
    var salaryMin = attr(qs(container, '[itemprop="baseSalary"] [itemprop="minValue"]'), 'content');
    var salaryMax = attr(qs(container, '[itemprop="baseSalary"] [itemprop="maxValue"]'), 'content');
    var salaryStr = '';
    if (salaryEl) {
      salaryStr = text(salaryEl);
    } else if (salaryMin) {
      salaryStr = (salaryCurrency || '') + ' ' + salaryMin;
      if (salaryMax) salaryStr += ' - ' + salaryMax;
    }
    var descEl = qs(container, '[itemprop="description"]');
    return {
      title: g('[itemprop="title"]') || g('[itemprop="name"]'),
      company: companyEl ? text(companyEl) : '',
      location: locEl ? text(locEl) : '',
      salary: clean(salaryStr),
      jobType: g('[itemprop="employmentType"]') || g('[itemprop="employmentTypes"]'),
      description: descEl ? text(descEl) : '',
      skills: [],
      originalApplyLink: attr(qs(container, '[itemprop="directApply"]'), 'href') || '',
      workMode: detectWorkModeFromString(text(container)),
    };
  }

  // ─── Board-Specific Extractors ──────────────────────────────────────────────

  function extractLinkedIn(doc) {
    var host = window.location.hostname;
    if (!host.endsWith('linkedin.com')) return null;
    var result = {};
    result.title =
      text(
        qs(
          doc,
          '.job-details-jobs-unified-top-card__job-title, ' +
            '.top-card-layout__title, ' +
            '.job-title, ' +
            '.jobs-details__main-content .job-title'
        )
      ) || '';
    result.company =
      text(
        qs(
          doc,
          '.job-details-jobs-unified-top-card__company-name, ' +
            '.top-card-layout__second-line a, ' +
            '.jobs-unified-top-card__company-name, ' +
            '.jobs-details__main-content .company'
        )
      ) || '';
    var bullets = qsa(
      doc,
      '.job-details-jobs-unified-top-card__primary-description span, ' +
        '.job-details-jobs-unified-top-card__bullet, ' +
        '.jobs-unified-top-card__bullet'
    );
    var locationParts = [];
    for (var i = 0; i < bullets.length; i++) {
      var t = text(bullets[i]);
      if (t) locationParts.push(t);
    }
    result.location = locationParts.join(', ');
    var workplaceEl = qs(doc, '.job-details-jobs-unified-top-card__workplace-type, [class*="workplace"]');
    result.workMode = workplaceEl ? text(workplaceEl) : '';
    result.salary = firstText(doc, [
      '.job-details-jobs-unified-top-card__salary-info',
      '[class*="salary"]',
      '[data-testid*="salary"]',
    ]);
    result.description = text(
      qs(doc, '.show-more-less-html, .jobs-description, [class*="description"]'),
      MAX_DESC_LENGTH
    );
    // Extract dedicated skills section (tag chips at bottom of LinkedIn postings)
    var skillsEls = qsa(doc, '.job-details-skill-match-status-list li, [class*="skill"] [class*="badge"], [class*="skill"] button');
    if (skillsEls.length > 0) {
      for (var si = 0; si < skillsEls.length; si++) {
        var st = text(skillsEls[si]);
        if (st) {
          result.skills = result.skills || [];
          if (result.skills.indexOf(st) === -1) result.skills.push(st);
        }
      }
    }
    result.jobType = detectJobTypeFromText(
      text(doc.body).toLowerCase().slice(0, MAX_TEXT_LENGTH)
    );
    result.originalApplyLink =
      attr(
        qs(doc, '.jobs-apply-button a, a.jobs-apply-button, [data-testid*="apply"] a'),
        'href'
      ) || '';
    return result.title ? result : null;
  }

  function extractIndeed(doc) {
    var host = window.location.hostname;
    if (!host.endsWith('indeed.com')) return null;
    var result = {};
    result.title = firstText(doc, [
      '.jobsearch-JobInfoHeader-title',
      '.jobTitle-cp',
      'h1[class*="title"]',
      '[data-testid*="jobTitle"]',
      'h1',
    ]);
    result.company = firstText(doc, [
      '.jobsearch-JobInfoHeader-companyName',
      '.companyName',
      '[data-testid*="company"]',
      '[class*="company"]',
    ]);
    result.location = firstText(doc, [
      '.jobsearch-JobInfoHeader-companyLocation',
      '[data-testid*="location"]',
      '[class*="location"]',
    ]);
    result.salary = firstText(doc, [
      '.jobsearch-JobMetadataHeader-item',
      '[class*="salary"]',
      '[data-testid*="salary"]',
      '#salaryRange',
    ]);
    result.description = text(
      qs(
        doc,
        '.jobsearch-JobComponent-description, ' +
          '#jobDescriptionText, ' +
          '[class*="description"]'
      ),
      MAX_DESC_LENGTH
    );
    result.jobType = detectJobTypeFromText(
      text(doc.body).toLowerCase().slice(0, MAX_TEXT_LENGTH)
    );
    result.originalApplyLink =
      attr(qs(doc, '.jobsearch-IndeedApplyButton a, [data-testid*="apply"] a'), 'href') || '';
    result.workMode = detectWorkModeFromText(
      text(doc.body).toLowerCase().slice(0, MAX_TEXT_LENGTH)
    );
    return result.title ? result : null;
  }

  function extractGlassdoor(doc) {
    var host = window.location.hostname;
    if (!host.endsWith('glassdoor.com') && !host.endsWith('glassdoor.co.in') && !host.endsWith('glassdoor.co.uk')) return null;
    var result = {};
    result.title = firstText(doc, [
      '.job-header-title',
      '[data-testid*="jobTitle"]',
      'h1[class*="title"]',
      'h1',
    ]);
    result.company = firstText(doc, [
      '.job-header-company',
      '[data-testid*="company"]',
      '[class*="company"]',
    ]);
    result.location = firstText(doc, [
      '[data-testid*="location"]',
      '[class*="location"]',
    ]);
    result.salary = firstText(doc, ['[class*="salary"]', '.salary']);
    result.description = text(
      qs(doc, '.job-description, [class*="description"]'),
      MAX_DESC_LENGTH
    );
    result.jobType = detectJobTypeFromText(
      text(doc.body).toLowerCase().slice(0, MAX_TEXT_LENGTH)
    );
    result.originalApplyLink =
      attr(
        qs(doc, 'a[data-testid*="apply"], [class*="apply"] a, a[href*="apply"]'),
        'href'
      ) || '';
    result.workMode = detectWorkModeFromText(
      text(doc.body).toLowerCase().slice(0, MAX_TEXT_LENGTH)
    );
    return result.title ? result : null;
  }

  function extractNaukri(doc) {
    var host = window.location.hostname;
    if (!host.endsWith('naukri.com')) return null;
    var result = {};
    result.title = firstText(doc, ['.jd-header-title', '.title', 'h1']);
    result.company = firstText(doc, [
      '.jd-header-company',
      '.company-info',
      '[class*="company"]',
    ]);
    result.location = firstText(doc, ['.jd-header-location', '.location', '[class*="location"]']);
    result.salary = firstText(doc, ['.salary', '.sal', '[class*="salary"]']);
    result.description = text(
      qs(doc, '.jd-desc, .job-description, [class*="description"]'),
      MAX_DESC_LENGTH
    );
    result.jobType = detectJobTypeFromText(
      text(doc.body).toLowerCase().slice(0, MAX_TEXT_LENGTH)
    );
    result.originalApplyLink =
      firstAttr(doc, [
        'a[href*="apply"]',
        '.apply a',
        'button[class*="apply"]',
      ]) || '';
    result.workMode = detectWorkModeFromText(
      text(doc.body).toLowerCase().slice(0, MAX_TEXT_LENGTH)
    );
    return result.title ? result : null;
  }

  function extractMonster(doc) {
    var host = window.location.hostname;
    if (
      !host.endsWith('monster.com') &&
      !host.endsWith('foundit.in') &&
      !host.endsWith('foundit.com')
    )
      return null;
    var result = {};
    result.title = firstText(doc, [
      '.title',
      '.job-title',
      'h1[class*="title"]',
      'h1',
    ]);
    result.company = firstText(doc, [
      '[class*="company"]',
      '.company-name',
      '.employer-name',
    ]);
    result.location = firstText(doc, [
      '[class*="location"]',
      '.location',
    ]);
    result.salary = firstText(doc, [
      '[class*="salary"]',
      '.salary',
    ]);
    result.description = text(
      qs(doc, '[class*="description"], .job-desc'),
      MAX_DESC_LENGTH
    );
    result.jobType = detectJobTypeFromText(
      text(doc.body).toLowerCase().slice(0, MAX_TEXT_LENGTH)
    );
    result.workMode = detectWorkModeFromText(
      text(doc.body).toLowerCase().slice(0, MAX_TEXT_LENGTH)
    );
    return result.title ? result : null;
  }

  function extractGenericJobBoard(doc) {
    var host = window.location.hostname;
    // Generic extraction for any board not specifically handled above
    var result = {};
    result.title = firstText(doc, [
      'h1',
      'h1[class*="title"]',
      'h2[class*="title"]',
      '[class*="job-title"]',
      '[class*="posting-title"]',
      '[data-testid*="jobTitle"]',
      '[data-testid*="job-title"]',
      '[itemprop="title"]',
      '[itemprop="name"]',
      '[data-qa*="job-title"]',
      '[data-automation*="job-title"]',
      '[class*="page-title"]',
    ]);
    if (!result.title) {
      result.title =
        findMeta(doc, 'og:title') || findMeta(doc, 'twitter:title') || '';
    }
    if (!result.title) {
      result.title = titleFromUrl();
    }
    result.company = firstText(doc, [
      '[class*="company-name"]',
      '[class*="company"]',
      '[data-testid*="companyName"]',
      '[data-testid*="company"]',
      '[itemprop="hiringOrganization"] [itemprop="name"]',
      '[itemprop="name"][class*="company"]',
      '[data-qa*="company"]',
      '[data-automation*="company"]',
      '.employer-name',
      '.hiring-organization',
    ]);
    result.location = firstText(doc, [
      '[class*="location"]',
      '[data-testid*="location"]',
      '[itemprop="jobLocation"]',
      '[itemprop="addressLocality"]',
      '[data-qa*="location"]',
      '[data-automation*="location"]',
      '[class*="workplace"]',
    ]);
    result.salary = firstText(doc, [
      '[itemprop="baseSalary"]',
      '[class*="salary"]',
      '[data-testid*="salary"]',
      '[data-qa*="salary"]',
      '[data-automation*="salary"]',
      '[class*="compensation"]',
      '[class*="pay"]',
      '.salary-range',
      '.pay-rate',
    ]);
    result.description = text(
      qs(
        doc,
        '[itemprop="description"], ' +
          '[data-testid*="description"], ' +
          '[data-qa*="description"], ' +
          '[class*="description"], ' +
          '[class*="job-description"], ' +
          '[class*="job-desc"], ' +
          '[class*="posting-description"], ' +
          'article, ' +
          '[role="main"], ' +
          'main, ' +
          '#job-description, ' +
          '#job-content, ' +
          '.description'
      ),
      MAX_DESC_LENGTH
    );
    result.jobType = detectJobTypeFromText(
      text(doc.body).toLowerCase().slice(0, MAX_TEXT_LENGTH)
    );
    result.originalApplyLink =
      firstAttr(doc, [
        'a[data-automation*="apply"]',
        'a[data-testid*="apply"]',
        'a[data-qa*="apply"]',
        'a[href*="apply"]',
        'a[class*="apply"]',
        '[class*="apply"] a',
      ]) || '';
    result.workMode = detectWorkModeFromText(
      text(doc.body).toLowerCase().slice(0, MAX_TEXT_LENGTH)
    );
    return result.title ? result : null;
  }

  // ─── Detection Helpers ────────────────────────────────────────────────────

  function detectWorkModeFromString(str) {
    var s = (str || '').toLowerCase();
    var negations = /no\s+remote|not\s+remote|does not support|is not|exclude/i;
    if (s.indexOf('remote') !== -1 && !negations.test(s)) return 'Remote';
    if (s.indexOf('hybrid') !== -1 && !negations.test(s)) return 'Hybrid';
    if (
      (s.indexOf('on-site') !== -1 ||
      s.indexOf('onsite') !== -1 ||
      s.indexOf('on site') !== -1 ||
      s.indexOf('in-office') !== -1 ||
      s.indexOf('in office') !== -1) && !negations.test(s)
    )
      return 'On-site';
    return '';
  }

  function detectWorkModeFromText(bodyText) {
    return detectWorkModeFromString(bodyText);
  }

  function detectJobTypeFromText(bodyText) {
    var s = (bodyText || '').toLowerCase();
    if (
      s.indexOf('full-time') !== -1 ||
      s.indexOf('full time') !== -1 ||
      s.indexOf('fulltime') !== -1
    )
      return 'Full-time';
    if (
      s.indexOf('part-time') !== -1 ||
      s.indexOf('part time') !== -1 ||
      s.indexOf('parttime') !== -1
    )
      return 'Part-time';
    if (s.indexOf('contract') !== -1) return 'Contract';
    if (s.indexOf('temporary') !== -1 || s.indexOf('temp') === 0)
      return 'Temporary';
    if (s.indexOf('internship') !== -1 || s.indexOf('intern') !== -1)
      return 'Internship';
    if (s.indexOf('freelance') !== -1) return 'Freelance';
    if (s.indexOf('volunteer') !== -1) return 'Volunteer';
    return '';
  }

  function extractSkillsFromDescription(desc) {
    // Try to extract skills from a comma-separated list or bullet points
    if (!desc) return [];
    var commonSkills = [
      'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Ruby', 'Go',
      'Rust', 'PHP', 'Swift', 'Kotlin', 'Scala', 'React', 'Angular', 'Vue',
      'Svelte', 'Next.js', 'Nuxt', 'Node', 'Node.js', 'Express', 'Django',
      'Flask', 'Spring', '.NET', 'ASP.NET', 'Laravel', 'Symfony', 'Rails',
      'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD',
      'Jenkins', 'GitHub Actions', 'GitLab CI', 'CircleCI', 'Ansible',
      'Chef', 'Puppet', 'Prometheus', 'Grafana', 'Datadog', 'New Relic',
      'SQL', 'NoSQL', 'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'GraphQL',
      'Elasticsearch', 'Kafka', 'RabbitMQ', 'Cassandra', 'DynamoDB',
      'Firebase', 'Supabase', 'REST', 'API', 'GraphQL', 'gRPC',
      'HTML', 'CSS', 'SASS', 'LESS', 'Tailwind', 'Bootstrap', 'Material UI',
      'Git', 'Agile', 'Scrum', 'Kanban', 'Jira', 'Confluence',
      'Machine Learning', 'AI', 'Data Science', 'Deep Learning', 'NLP',
      'Computer Vision', 'TensorFlow', 'PyTorch', 'Scikit-learn',
      'Tableau', 'Power BI', 'Excel', 'Salesforce', 'SAP', 'HubSpot',
      'Stripe', 'Twilio', 'Auth0', 'Okta', 'Figma', 'Sketch', 'Adobe XD',
      'Photoshop', 'Illustrator', 'Linux', 'Bash', 'PowerShell', 'Nginx',
      'Apache', 'Webpack', 'Vite', 'Babel', 'ESLint', 'Prettier', 'Jest',
      'Mocha', 'Cypress', 'Playwright', 'Selenium', 'Puppeteer',
      'Microservices', 'Serverless', 'Event-Driven', 'DDD', 'TDD',
    ];
    var found = [];
    var lower = desc.toLowerCase();
    for (var i = 0; i < commonSkills.length; i++) {
      if (lower.indexOf(commonSkills[i].toLowerCase()) !== -1) {
        found.push(commonSkills[i]);
      }
    }
    return found;
  }

  // ─── SPA Wait Helper ─────────────────────────────────────────────────────

  function waitForContent(maxMs) {
    maxMs = maxMs || SPA_WAIT_MAX;
    var interval = SPA_WAIT_INTERVAL;
    var selectors = [
      '[itemprop="title"]',
      'h1',
      '.job-title',
      '[class*="job-title"]',
      '[data-testid*="job"]',
      '[class*="jobsearch"]',
    ];
    return new Promise(function (resolve) {
      var elapsed = 0;
      var check = function () {
        if (elapsed >= maxMs) return resolve();
        for (var i = 0; i < selectors.length; i++) {
          if (document.querySelector(selectors[i])) return resolve();
        }
        elapsed += interval;
        setTimeout(check, interval);
      };
      check();
    });
  }

  // ─── Main Scraper ──────────────────────────────────────────────────────────

  function scrapeJobPage() {
    var doc = document.cloneNode(true);
    var hostname = window.location.hostname;

    // 1. Try LD+JSON (handles @graph wrappers used by LinkedIn, Google Jobs, etc.)
    var data = extractFromLdJson(doc);
    if (data && data.title) {
      data.source = hostname;
      data.originalUrl = window.location.href;
      if (!data.description || data.description.length < 20) {
        data.description = text(
          qs(
            doc,
            '[itemprop="description"], ' +
              '[class*="description"], ' +
              'article, ' +
              '[role="main"], ' +
              'main'
          ),
          MAX_DESC_LENGTH
        );
      }
      if (!data.skills || data.skills.length === 0) {
        data.skills = extractSkillsFromDescription(data.description);
      }
      return data;
    }

    // 2. Try Microdata
    data = extractFromMicrodata(doc);
    if (data && data.title) {
      data.source = hostname;
      data.originalUrl = window.location.href;
      if (!data.skills || data.skills.length === 0) {
        data.skills = extractSkillsFromDescription(data.description);
      }
      return data;
    }

    // 3. Try board-specific extractors
    var extractors = [
      extractLinkedIn,
      extractIndeed,
      extractGlassdoor,
      extractNaukri,
      extractMonster,
    ];
    for (var i = 0; i < extractors.length; i++) {
      data = extractors[i](doc);
      if (data && data.title) {
        data.source = hostname;
        data.originalUrl = window.location.href;
        data.skills = extractSkillsFromDescription(data.description);
        if (!data.workMode) {
          data.workMode = detectWorkModeFromText(
            text(doc.body).toLowerCase().slice(0, MAX_TEXT_LENGTH)
          );
        }
        if (!data.jobType) {
          data.jobType = detectJobTypeFromText(
            text(doc.body).toLowerCase().slice(0, MAX_TEXT_LENGTH)
          );
        }
        return data;
      }
    }

    // 4. Generic fallback with 50+ selectors
    data = extractGenericJobBoard(doc);
    if (!data.title && !data.company) {
      // Last resort: try to find company name from page text patterns
      var bodySnippet = text(doc.body, MAX_TEXT_LENGTH);
      data.company =
        data.company ||
        extractCompanyFromText(bodySnippet);
      data.location =
        data.location ||
        extractLocationFromText(bodySnippet);
      data.description =
        data.description ||
        text(
          qs(doc, 'article, [role="main"], main, #content, #job-content'),
          MAX_DESC_LENGTH
        );
    }
    data.source = hostname;
    data.originalUrl = window.location.href;
    data.skills = extractSkillsFromDescription(data.description);
    return data;
  }

  function extractCompanyFromText(bodyText) {
    var patterns = [
      /(?:at|for|with)\s+([A-Z][A-Za-z0-9&.\s]{2,50}?)\s+(?:is\s+(?:hiring|looking|seeking)|has\s+(?:an?|the)\s+(?:open|opportunity|position)|are\s+hiring)/i,
      /([A-Z][A-Za-z0-9&.\s]{2,40}?)\s+(?:is|are)\s+hiring/i,
      /(?:company|organization|firm|startup)\s*[:–\-]?\s*([A-Z][A-Za-z0-9&.\s]{2,40})/i,
    ];
    for (var i = 0; i < patterns.length; i++) {
      var m = bodyText.match(patterns[i]);
      if (m) return clean(m[1]);
    }
    return '';
  }

  function extractLocationFromText(bodyText) {
    var patterns = [
      /(?:location|locality|place|office|based)\s*[:–\-]?\s*([A-Z][A-Za-z\s,]{2,60}?)(?:\d|remote|hybrid|on.?site|in\s+office)/i,
      /(?:remote|hybrid|on.?site|in\s+office)\s*[:–\-]?\s*([A-Z][A-Za-z\s,]{2,60})/i,
      /\b(in|at)\s+([A-Z][a-z]+(?:\s[A-Z][a-z]+)?,\s*[A-Z]{2})\b/,
    ];
    for (var i = 0; i < patterns.length; i++) {
      var m = bodyText.match(patterns[i]);
      if (m) return clean(m[1] || m[2]);
    }
    return '';
  }

  // ─── Auth Sync (for JobPilot App Pages) ────────────────────────────────────

  function isJobPilotApp() {
    var host = window.location.hostname;
    return (
      host.endsWith('.vercel.app') ||
      host === 'localhost'
    );
  }

  function getApiBaseUrl() {
    return window.location.hostname === 'localhost'
      ? 'http://localhost:5051/api'
      : 'https://web-dev-journey-cnee.onrender.com/api';
  }

  function syncToken() {
    try {
      var token = window.localStorage.getItem('jobpilot_token');
      if (token) {
        chrome.runtime.sendMessage({
          action: 'SYNC_AUTH_TOKEN',
          token: token,
          apiBaseUrl: getApiBaseUrl(),
        }, function () {
          if (chrome.runtime.lastError) {
            // background not ready, will retry on next event
          }
        });
      }
    } catch (e) {
      // storage unavailable
    }
  }

  // ─── Message Listener ──────────────────────────────────────────────────────

  chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === 'REQUEST_TOKEN_SYNC') {
      syncToken();
      sendResponse({ synced: true });
      return false;
    }
    if (request.action === 'PARSE_JOB') {
      var jobData = scrapeJobPage();
      sendResponse({ success: true, data: jobData });
      return false;
    }
    return false;
  });

  // ─── Init ──────────────────────────────────────────────────────────────────

  if (isJobPilotApp()) {
    syncToken();
    window.addEventListener('jobpilot:auth-updated', syncToken);
    window.addEventListener('storage', function (e) {
      if (e.key === 'jobpilot_token' && e.newValue) {
        chrome.runtime.sendMessage({
          action: 'SYNC_AUTH_TOKEN',
          token: e.newValue,
          apiBaseUrl: getApiBaseUrl(),
        });
      }
    });
  } else {
    // Wait for SPA content, then scrape once
    function doScrape() {
      var idleFn =
        window.requestIdleCallback ||
        function (fn) {
          setTimeout(fn, 200);
        };
      idleFn(function () {
        var data = scrapeJobPage();
        document.dispatchEvent(
          new CustomEvent('jobpilot:scrape-complete', { detail: data })
        );
      });
    }
    waitForContent().then(doScrape);
    // Watch for SPA URL changes (popstate / pushState)
    var trackedUrl = location.href;
    function checkUrlChange() {
      if (location.href !== trackedUrl) {
        trackedUrl = location.href;
        waitForContent().then(doScrape);
      }
    }
    window.addEventListener('popstate', checkUrlChange);
    // Intercept pushState/replaceState to detect SPA navigation
    (function (history) {
      var pushState = history.pushState;
      history.pushState = function () {
        pushState.apply(history, arguments);
        checkUrlChange();
      };
      var replaceState = history.replaceState;
      history.replaceState = function () {
        replaceState.apply(history, arguments);
        checkUrlChange();
      };
    })(window.history);
  }
})();
