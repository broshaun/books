
import { createFileRoute } from "@tanstack/solid-router";
import { Layout } from "@/pages/auth/main";


export const Route = createFileRoute('/auth')({
    component: Layout,
})
