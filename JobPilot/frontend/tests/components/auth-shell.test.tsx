import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { AuthShell } from "@/components/auth/auth-shell";

describe("AuthShell", () => {
  const defaultProps = {
    title: "Welcome back",
    description: "Sign in to your account",
    eyebrow: "Secure access",
    children: <input placeholder="Email" />,
    footer: <a href="/signup">Create account</a>,
  };

  it("renders title, description, and eyebrow", () => {
    render(<AuthShell {...defaultProps} />);
    expect(screen.getByText("Welcome back")).toBeInTheDocument();
    expect(screen.getByText("Sign in to your account")).toBeInTheDocument();
    expect(screen.getByText("Secure access")).toBeInTheDocument();
  });

  it("renders children", () => {
    render(<AuthShell {...defaultProps} />);
    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
  });

  it("renders footer", () => {
    render(<AuthShell {...defaultProps} />);
    expect(screen.getByText("Create account")).toBeInTheDocument();
  });

  it("renders the logo and branding in the hero section", () => {
    render(<AuthShell {...defaultProps} />);
    expect(screen.getByText("JP")).toBeInTheDocument();
    expect(screen.getAllByText("JobPilot").length).toBeGreaterThanOrEqual(1);
  });

  it("renders three highlight cards with icons", () => {
    render(<AuthShell {...defaultProps} />);
    expect(screen.getByText("Stay on follow-ups")).toBeInTheDocument();
    expect(screen.getByText("See the pipeline clearly")).toBeInTheDocument();
    expect(screen.getByText("Use AI where it helps")).toBeInTheDocument();
  });

  it("renders the tagline", () => {
    render(<AuthShell {...defaultProps} />);
    expect(screen.getByText(/Track every application/)).toBeInTheDocument();
  });
});
