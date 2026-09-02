import { ReactNode } from "react";
import Query from "./Query";
import Theme from "./Theme";
import { HeaderTitleProvider } from "./HeaderTitleProvider";
import EmotionRegistry from "./EmotionRegistry";
import ToastProvider from "./Toast";
import ConfirmProvider from "./Confirm";

export default function RootProvider({ children }: { children: ReactNode }) {
    return (
        <EmotionRegistry>
            <HeaderTitleProvider>
                <Theme>
                    <Query>
                        <ToastProvider>
                            <ConfirmProvider>{children}</ConfirmProvider>
                        </ToastProvider>
                    </Query>
                </Theme>
            </HeaderTitleProvider>
        </EmotionRegistry>
    );
}
