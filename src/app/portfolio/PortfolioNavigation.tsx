import TableOfContents, { type NavigationItem } from "@/components/navigation/TableOfContents";

export default function PortfolioNavigation({ items }: { items: NavigationItem[] }) {
    return (
        <div className="pf-portfolioNavigation">
            <TableOfContents items={items} topId="portfolio-top" label="포트폴리오 목차" />
        </div>
    );
}
