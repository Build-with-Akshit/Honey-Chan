import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Heart } from "lucide-react";

describe("Button", () => {
  it("renders children text", () => {
    render(<Button>Click Me</Button>);
    expect(screen.getByText("Click Me")).toBeInTheDocument();
  });

  it("applies primary variant by default", () => {
    render(<Button>Primary</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("btn-primary");
  });

  it("applies secondary variant", () => {
    render(<Button variant="secondary">Secondary</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("btn-secondary");
  });

  it("applies ghost variant", () => {
    render(<Button variant="ghost">Ghost</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("btn-ghost");
  });

  it("applies outline variant", () => {
    render(<Button variant="outline">Outline</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("btn-outline");
  });

  it("applies size classes", () => {
    const { rerender } = render(<Button size="sm">Small</Button>);
    expect(screen.getByRole("button").className).toContain("text-xs");

    rerender(<Button size="lg">Large</Button>);
    expect(screen.getByRole("button").className).toContain("text-sm");
  });

  it("renders left icon", () => {
    render(<Button leftIcon={Heart}>With Icon</Button>);
    expect(screen.getByText("With Icon")).toBeInTheDocument();
    // Lucide renders as SVG
    expect(document.querySelector("svg")).toBeInTheDocument();
  });

  it("disables when loading", () => {
    render(<Button loading>Loading</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("disables when disabled prop is true", () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("calls onClick when clicked", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click</Button>);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not call onClick when disabled", () => {
    const onClick = vi.fn();
    render(<Button disabled onClick={onClick}>No Click</Button>);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).not.toHaveBeenCalled();
  });
});

describe("Card", () => {
  it("renders children", () => {
    render(<Card>Card Content</Card>);
    expect(screen.getByText("Card Content")).toBeInTheDocument();
  });

  it("applies default variant", () => {
    render(<Card>Default</Card>);
    const card = screen.getByText("Default").closest("div");
    expect(card?.className).toContain("card");
  });

  it("applies hoverable class", () => {
    render(<Card hoverable>Hoverable</Card>);
    const card = screen.getByText("Hoverable").closest("div");
    expect(card?.className).toContain("card-interactive");
  });

  it("removes padding when noPadding", () => {
    render(<Card noPadding>No Pad</Card>);
    const card = screen.getByText("No Pad").closest("div");
    expect(card?.className).toContain("!p-0");
  });
});

describe("Input", () => {
  it("renders input element", () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText("Enter text")).toBeInTheDocument();
  });

  it("renders label", () => {
    render(<Input label="Email" />);
    expect(screen.getByText("Email")).toBeInTheDocument();
  });

  it("renders error message", () => {
    render(<Input error="Field is required" />);
    expect(screen.getByText("Field is required")).toBeInTheDocument();
  });

  it("renders hint message", () => {
    render(<Input hint="Enter your email" />);
    expect(screen.getByText("Enter your email")).toBeInTheDocument();
  });

  it("does not show hint when error is present", () => {
    render(<Input error="Error" hint="Hint" />);
    expect(screen.getByText("Error")).toBeInTheDocument();
    expect(screen.queryByText("Hint")).not.toBeInTheDocument();
  });

  it("renders left icon", () => {
    render(<Input leftIcon={Heart} />);
    expect(document.querySelector("svg")).toBeInTheDocument();
  });

  it("passes value and onChange", () => {
    const onChange = vi.fn();
    render(<Input value="test" onChange={onChange} />);
    expect(screen.getByDisplayValue("test")).toBeInTheDocument();
  });
});

describe("StatusBadge", () => {
  it("renders pass state", () => {
    render(<StatusBadge state="pass" />);
    expect(screen.getByText("Pass")).toBeInTheDocument();
  });

  it("renders custom label", () => {
    render(<StatusBadge state="pass" label="Verified" />);
    expect(screen.getByText("Verified")).toBeInTheDocument();
  });

  it("renders fail state", () => {
    render(<StatusBadge state="fail" />);
    expect(screen.getByText("Fail")).toBeInTheDocument();
  });

  it("renders pending state", () => {
    render(<StatusBadge state="pending" label="In Progress" />);
    expect(screen.getByText("In Progress")).toBeInTheDocument();
  });

  it("hides dot when showDot is false", () => {
    const { container } = render(<StatusBadge state="pass" showDot={false} />);
    expect(container.querySelector(".badge-dot")).not.toBeInTheDocument();
  });

  it("shows dot by default", () => {
    const { container } = render(<StatusBadge state="pass" />);
    expect(container.querySelector(".badge-dot")).toBeInTheDocument();
  });

  it("applies md size class", () => {
    render(<StatusBadge state="pass" size="md" />);
    const badge = screen.getByText("Pass").closest("span");
    expect(badge?.className).toContain("text-xs");
  });
});
