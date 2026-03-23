import F1navbar from "@/components/f1/F1navbar"


export default function F1Layout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <>
            <F1navbar />
            {children}
        </>
    )
}