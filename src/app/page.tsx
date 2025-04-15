// src/app/page.tsx

import Profile from "@/components/Profile/Profile";
import PostGrid from "@/components/PostGrid/PostGird";

export default function Home() {
    return (
        <div className="home">
            <Profile />
            <PostGrid />
        </div>
    );
}
