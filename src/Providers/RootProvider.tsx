import { ReactNode } from "react";
import Query from "./Query";
import Theme from "./Theme";
import { HeaderTitleProvider } from "./HeaderTitleProvider";
import EmotionRegistry from "./EmotionRegistry";
import ToastProvider from "./Toast";

export default function RootProvider({ children }: { children: ReactNode }) {
    return (
        <EmotionRegistry>
            <HeaderTitleProvider>
                <Theme>
                    <Query>
                        <ToastProvider>{children}</ToastProvider>
                    </Query>
                </Theme>
            </HeaderTitleProvider>
        </EmotionRegistry>
    );
}
