export function MentorNav() {
  return (
    <header className="bg-primary text-on-primary px-8 py-4 flex items-center justify-between border-b-4 border-secondary-fixed">
      <span className="font-epilogue font-black text-lg uppercase tracking-tight">
        MENTOR PORTAL
      </span>
      <a
        href="/mentor/logout"
        className="font-grotesk text-xs uppercase tracking-widest text-on-primary/60 hover:text-on-primary"
      >
        Logout
      </a>
    </header>
  )
}
