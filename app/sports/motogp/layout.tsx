import MotoGPNavBar from "@/components/motogp/MotoGPNavBar"

export default function MotoGPLayout({ children }: { children: React.ReactNode }) {
    return (
        <div data-sport="motogp">
            <MotoGPNavBar />
            {children}
        </div>
    )
}