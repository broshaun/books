import { loginCache } from "@/api/cache/loginCache";
import UserProfileCard from "./ui/UserProfileCard";



export function AuthIndex() {


    const { data, loading } = loginCache.info().useQuery()

    console.log('data', data())

    return <UserProfileCard
        onLogout={()=>{}}
    />
}