import FootballNavBar from "@/components/football/Footballnavbar"

export default function FootballLayout({ children }: { children: React.ReactNode }) {
    return (
        <div data-sport="football">
            <FootballNavBar />
            {children}
        </div>
    )
}