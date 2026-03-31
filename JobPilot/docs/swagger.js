import swaggerJSDoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "JobPilot API",
      version: "1.0.0",
      description: "API documentation for JobPilot Job Tracking App",
    },
    servers: [
      {
        url: "http://localhost:5051/api",
      },
    ],
  },
  apis: [],
};

const swaggerSpec = swaggerJSDoc(options);

swaggerSpec.paths = {
  "/health": {
    get: {
      summary: "Health Check",
      responses: {
        200: {
          description: "Server is running",
        },
      },
    },
  },

  "/auth/login": {
    post: {
      summary: "Login user",
      responses: {
        200: {
          description: "Login success",
        },
      },
    },
  },

  "/auth/signup": {
    post: {
      summary: "Register user",
      responses: {
        201: {
          description: "User created",
        },
      },
    },
  },

  "/jobs": {
    get: {
      summary: "Get all jobs",
      responses: {
        200: {
          description: "Jobs list",
        },
      },
    },

    post: {
      summary: "Create job",
      responses: {
        201: {
          description: "Job created",
        },
      },
    },
  },
};

export default swaggerSpec;