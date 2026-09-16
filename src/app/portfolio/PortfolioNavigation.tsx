import TableOfContents, { type NavigationItem } from "@/components/navigation/TableOfContents";
import styles from "./portfolio.module.css";

export default function PortfolioNavigation({ items }: { items: NavigationItem[] }) {
    return (
        <div className={styles.portfolioNavigation}>
            <TableOfContents items={items} topId="portfolio-top" label="포트폴리오 목차" />
        </div>
    );
}
