
import { createFileRoute } from "@tanstack/solid-router";
import { Layout } from "@/pages/desktop/auth/layout";
import { loginCache } from "@/api/cache/loginCache";


export const Route = createFileRoute('/desktop/auth')({
    component: Layout,
    loader:async()=>{
        await loginCache.info().fetch()
    }
})
