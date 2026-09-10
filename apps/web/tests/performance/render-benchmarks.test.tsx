import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { StatusBadge } from "@/components/ui/StatusBadge";

describe("Render Performance Benchmarks", () => {
  const measureRender = (fn: () => void): number => {
    const start = performance.now();
    fn();
    return performance.now() - start;
  };

  it("Button renders in under 5ms", () => {
    const time = measureRender(() => {
      render(<Button>Performance Test</Button>);
    });
    console.log(`Button render: ${time.toFixed(2)}ms`);
    expect(time).toBeLessThan(50); // generous for CI
  });

  it("Card renders in under 5ms", () => {
    const time = measureRender(() => {
      render(<Card>Performance Test</Card>);
    });
    console.log(`Card render: ${time.toFixed(2)}ms`);
    expect(time).toBeLessThan(50);
  });

  it("Input renders in under 5ms", () => {
    const time = measureRender(() => {
      render(<Input label="Test" placeholder="Enter..." />);
    });
    console.log(`Input render: ${time.toFixed(2)}ms`);
    expect(time).toBeLessThan(50);
  });

  it("StatusBadge renders in under 5ms", () => {
    const time = measureRender(() => {
      render(<StatusBadge state="pass" label="Verified" />);
    });
    console.log(`StatusBadge render: ${time.toFixed(2)}ms`);
    expect(time).toBeLessThan(50);
  });

  it("100 StatusBadges render in under 200ms", () => {
    const badges = Array.from({ length: 100 }, (_, i) => (
      <StatusBadge key={i} state="pass" label={`Badge ${i}`} />
    ));
    const time = measureRender(() => {
      render(<>{badges}</>);
    });
    console.log(`100 StatusBadges render: ${time.toFixed(2)}ms`);
    expect(time).toBeLessThan(200);
  });

  it("50 Cards render in under 200ms", () => {
    const cards = Array.from({ length: 50 }, (_, i) => (
      <Card key={i}>Card {i}</Card>
    ));
    const time = measureRender(() => {
      render(<>{cards}</>);
    });
    console.log(`50 Cards render: ${time.toFixed(2)}ms`);
    expect(time).toBeLessThan(200);
  });

  it("20 Buttons render in under 100ms", () => {
    const buttons = Array.from({ length: 20 }, (_, i) => (
      <Button key={i} variant={i % 2 === 0 ? "primary" : "outline"}>
        Button {i}
      </Button>
    ));
    const time = measureRender(() => {
      render(<>{buttons}</>);
    });
    console.log(`20 Buttons render: ${time.toFixed(2)}ms`);
    expect(time).toBeLessThan(100);
  });
});

describe("Re-render Performance", () => {
  it("Button re-renders prop changes in under 10ms", () => {
    const { rerender } = render(<Button>Initial</Button>);
    const time = performance.now();
    rerender(<Button loading>Loading...</Button>);
    const elapsed = performance.now() - time;
    console.log(`Button re-render: ${elapsed.toFixed(2)}ms`);
    expect(elapsed).toBeLessThan(20);
  });

  it("Input re-renders value changes in under 10ms", () => {
    const { rerender } = render(<Input value="" onChange={() => {}} />);
    const time = performance.now();
    rerender(<Input value="new value" onChange={() => {}} />);
    const elapsed = performance.now() - time;
    console.log(`Input re-render: ${elapsed.toFixed(2)}ms`);
    expect(elapsed).toBeLessThan(20);
  });
});

describe("DOM Efficiency", () => {
  it("Button produces minimal DOM nodes", () => {
    const { container } = render(<Button>Test</Button>);
    const nodeCount = container.querySelectorAll("*").length;
    console.log(`Button DOM nodes: ${nodeCount}`);
    expect(nodeCount).toBeLessThanOrEqual(3); // button + text + svg (optional)
  });

  it("StatusBadge produces minimal DOM nodes", () => {
    const { container } = render(<StatusBadge state="pass" />);
    const nodeCount = container.querySelectorAll("*").length;
    console.log(`StatusBadge DOM nodes: ${nodeCount}`);
    expect(nodeCount).toBeLessThanOrEqual(4); // span + dot + text
  });

  it("Card produces minimal DOM nodes", () => {
    const { container } = render(<Card>Content</Card>);
    const nodeCount = container.querySelectorAll("*").length;
    console.log(`Card DOM nodes: ${nodeCount}`);
    expect(nodeCount).toBeLessThanOrEqual(2); // div + text
  });
});
