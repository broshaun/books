
import { createFileRoute } from "@tanstack/solid-router";
import { Layout } from "@/pages/auth/main";
import { loginCache } from "@/api/cache/loginCache";

export const Route = createFileRoute('/auth')({
    component: Layout,
    loader:async()=>{
        await loginCache.info().fetch()
    }
})
