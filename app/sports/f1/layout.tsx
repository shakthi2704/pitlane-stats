import F1Footer from "@/components/f1/F1Footer"
import F1navBar from "@/components/f1/F1navBar"

export default function F1Layout({ children }: { children: React.ReactNode }) {

  return (
    <div data-sport="f1">
      <F1navBar />
      {children}
      {/* <F1Footer /> */}
    </div>
  )
}
