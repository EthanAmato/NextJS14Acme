// loading is a special Next.js file built on top of suspense and allows you to create loading UI to show as 
// a  replacement while page content loads
// Since sidebar is static, it is shown immediately and the user can interact with it while the dynamic content is loading

// We can expand on this by having loading skeletons
// Loading.tsx will apply to nested folders underneath, so we put it in an (overview) folder to make sure this skeleton only applies
// to our dashboard page. Things with parentheses are ignored in the route 

import DashboardSkeleton from "../../ui/skeletons"

export default function Loading() {
    return <DashboardSkeleton/>
}