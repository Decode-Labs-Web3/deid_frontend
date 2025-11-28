import { render, screen } from "@testing-library/react";
import { TaskCard } from "../TaskCard";

vi.mock("wagmi", () => ({
  useAccount: () => ({ address: undefined, isConnected: false }),
  useWalletClient: () => ({ data: null }),
}));

vi.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={props.alt} src={props.src} />
  ),
}));

const baseProps = {
  id: "task-1",
  task_title: "Complete Onboarding",
  task_description: "Finish your onboarding tutorials",
  validation_type: "erc20_balance_check",
  blockchain_network: "ethereum",
  token_contract_address: "0x0",
  minimum_balance: 1,
  badge_details: {
    badge_name: "Starter Badge",
    badge_description: "Awarded for getting started",
    badge_image: "https://example.com/image.png",
    attributes: [],
  },
  created_at: new Date().toISOString(),
};

describe("TaskCard component", () => {
  it("renders verify button when wallet is not connected", () => {
    render(<TaskCard {...baseProps} />);
    const button = screen.getByRole("button", { name: /verify task/i });
    expect(button).toBeInTheDocument();
    expect(button).toBeDisabled();
  });
});
