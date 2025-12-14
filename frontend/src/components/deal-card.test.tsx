import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { DealCard } from "./deal-card";

describe("DealCard", () => {
    const defaultProps = {
        dealId: "deal-123",
        token: "Rift Token",
        symbol: "RIFT",
        amount: "1,000",
        discount: 15,
        totalCost: "$850.00",
        marketValue: "$1,000.00",
        status: "open" as const,
        lockPeriod: "4 weeks",
    };

    it("renders deal information correctly", () => {
        render(<DealCard {...defaultProps} />);

        expect(screen.getByText("R")).toBeInTheDocument(); // Symbol initial
        expect(screen.getByText("Rift Token")).toBeInTheDocument();
        expect(screen.getByText("1,000")).toBeInTheDocument();
        expect(screen.getByText("-15%")).toBeInTheDocument();
        expect(screen.getByText("OPEN")).toBeInTheDocument();
        expect(screen.getByText("$850.00")).toBeInTheDocument();
        expect(screen.getByText("LOCK: 4 weeks")).toBeInTheDocument();
    });

    it("renders View Details link with correct URL", () => {
        render(<DealCard {...defaultProps} />);

        const link = screen.getByRole("link");
        expect(link).toHaveAttribute("href", "/deals/deal-123");
    });

    it("renders Accept button and calls onAccept when clicked", () => {
        const onAccept = vi.fn();
        render(<DealCard {...defaultProps} onAccept={onAccept} />);

        const acceptButton = screen.getByText("Accept Deal");
        fireEvent.click(acceptButton);

        expect(onAccept).toHaveBeenCalledTimes(1);
    });

    it("renders Cancel button and calls onCancel when clicked", () => {
        const onCancel = vi.fn();
        render(<DealCard {...defaultProps} onCancel={onCancel} />);

        const cancelButton = screen.getByText("Cancel");
        fireEvent.click(cancelButton);

        expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it("does not render action buttons if not provided/appropriate", () => {
        render(
            <DealCard
                {...defaultProps}
                status="completed"
                onAccept={() => { }}
                onCancel={() => { }}
            />
        );

        expect(screen.queryByText("Accept Deal")).not.toBeInTheDocument();
        expect(screen.queryByText("Cancel")).not.toBeInTheDocument();
        expect(screen.getByText("COMPLETED")).toBeInTheDocument();
    });
});
