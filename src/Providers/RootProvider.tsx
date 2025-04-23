import { ReactNode } from "react";
import Query from "./Query";
import Theme from "./Theme";

export default function RootProvider({ children }: { children: ReactNode }) {
    return (
        <Theme>
            <Query>{children}</Query>
        </Theme>
    );
}
