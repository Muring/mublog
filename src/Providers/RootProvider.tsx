import { ReactNode } from "react";
import Query from "./Query";
import Theme from "./Theme";
import { HeaderTitleProvider } from "./HeaderTitleProvider";
import EmotionRegistry from "./EmotionRegistry";

export default function RootProvider({ children }: { children: ReactNode }) {
    return (
        <EmotionRegistry>
            <HeaderTitleProvider>
                <Theme>
                    <Query>{children}</Query>
                </Theme>
            </HeaderTitleProvider>
        </EmotionRegistry>
    );
}
