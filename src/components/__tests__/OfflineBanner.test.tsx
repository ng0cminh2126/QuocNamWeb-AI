import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { OfflineBanner } from "../OfflineBanner";

describe("OfflineBanner", () => {
  it("renders nothing when online and wasOffline=false", () => {
    // GIVEN: isOnline=true, wasOffline=false
    const { container } = render(
      <OfflineBanner isOnline={true} wasOffline={false} />
    );

    // THEN: Component returns null (nothing rendered)
    expect(container.firstChild).toBeNull();
  });

  it("renders offline warning banner when isOnline=false", () => {
    // GIVEN: isOnline=false
    render(<OfflineBanner isOnline={false} wasOffline={false} />);

    // THEN: Shows orange banner with WifiOff icon
    const banner = screen.getByTestId("offline-banner");
    expect(banner).toBeInTheDocument();

    // THEN: Shows text "Không có kết nối mạng..."
    const text = screen.getByText(/Không có kết nối mạng/i);
    expect(text).toBeInTheDocument();

    // THEN: Has orange background
    expect(banner).toHaveClass("bg-orange-50");
  });

  it("renders recovery banner when isOnline=true and wasOffline=true", () => {
    // GIVEN: isOnline=true, wasOffline=true
    render(<OfflineBanner isOnline={true} wasOffline={true} />);

    // THEN: Shows green banner with Wifi icon
    const banner = screen.getByTestId("online-banner");
    expect(banner).toBeInTheDocument();

    // THEN: Shows text "Đã kết nối lại mạng"
    const text = screen.getByText(/Đã kết nối lại mạng/i);
    expect(text).toBeInTheDocument();

    // THEN: Has green background
    expect(banner).toHaveClass("bg-green-50");
  });
});
