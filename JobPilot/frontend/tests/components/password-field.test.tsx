import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PasswordField } from "@/components/auth/password-field";

describe("PasswordField", () => {
  const defaultProps = {
    id: "password",
    label: "Password",
    value: "",
    onChange: () => {},
  };

  it("renders label and input", () => {
    render(<PasswordField {...defaultProps} />);
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
  });

  it("renders input as password type by default", () => {
    render(<PasswordField {...defaultProps} />);
    const input = screen.getByLabelText("Password") as HTMLInputElement;
    expect(input.type).toBe("password");
  });

  it("toggles visibility when clicking the show/hide button", () => {
    render(<PasswordField {...defaultProps} value="secret123" />);
    const input = screen.getByLabelText("Password") as HTMLInputElement;
    const toggle = screen.getByRole("button", { name: "Show password" });

    expect(input.type).toBe("password");
    fireEvent.click(toggle);
    expect(input.type).toBe("text");
    expect(screen.getByRole("button", { name: "Hide password" })).toBeInTheDocument();
  });

  it("shows error text when error prop is provided", () => {
    render(<PasswordField {...defaultProps} error="Password is too weak" />);
    expect(screen.getByText("Password is too weak")).toBeInTheDocument();
  });

  it("shows description when no error and description is provided", () => {
    render(<PasswordField {...defaultProps} description="At least 8 characters" />);
    expect(screen.getByText("At least 8 characters")).toBeInTheDocument();
  });

  it("does not render description when error is present", () => {
    render(
      <PasswordField
        {...defaultProps}
        error="Too weak"
        description="At least 8 characters"
      />,
    );
    expect(screen.queryByText("At least 8 characters")).not.toBeInTheDocument();
    expect(screen.getByText("Too weak")).toBeInTheDocument();
  });

  it("calls onChange when user types", () => {
    const onChange = vi.fn();
    render(<PasswordField {...defaultProps} onChange={onChange} />);
    const input = screen.getByLabelText("Password");
    fireEvent.change(input, { target: { value: "mypassword" } });
    expect(onChange).toHaveBeenCalledWith("mypassword");
  });

  it("passes autoComplete, placeholder, required, minLength to input", () => {
    render(
      <PasswordField
        {...defaultProps}
        autoComplete="new-password"
        placeholder="Enter password"
        required={true}
        minLength={8}
      />,
    );
    const input = screen.getByLabelText("Password");
    expect(input).toHaveAttribute("autoComplete", "new-password");
    expect(input).toHaveAttribute("placeholder", "Enter password");
    expect(input).toBeRequired();
    expect(input).toHaveAttribute("minLength", "8");
  });
});
