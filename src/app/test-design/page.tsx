export default function DesignTestPage() {
  return (
    <div className="p-8 space-y-8 bg-surface">

      {/* Typography */}
      <h1 className="font-epilogue font-black text-4xl uppercase tracking-tight leading-none">
        Epilogue Black
      </h1>
      <p className="font-grotesk text-base">Space Grotesk body text</p>

      {/* Colors */}
      <div className="flex gap-4">
        <div className="w-16 h-16 bg-primary border-2 border-primary" />
        <div className="w-16 h-16 bg-secondary-fixed border-2 border-primary" />
        <div className="w-16 h-16 bg-surface border-2 border-primary" />
        <div className="w-16 h-16 bg-error border-2 border-primary" />
      </div>

      {/* Shadows */}
      <div className="flex gap-8">
        <div className="w-24 h-24 bg-white border-2 border-primary shadow-hard" />
        <div className="w-24 h-24 bg-white border-2 border-primary shadow-hard-sm" />
        <div className="w-24 h-24 bg-white border-2 border-primary shadow-hard-lg" />
      </div>

      {/* Border radius — should be 0 (square corners) */}
      <div className="w-24 h-24 bg-secondary-fixed border-2 border-primary rounded-xl shadow-hard">
        No rounding
      </div>

      {/* Torn edges */}
      <div className="bg-primary text-on-primary p-8 pb-16 torn-edge-bottom">
        Torn bottom edge
      </div>
      <div className="bg-secondary-fixed text-on-secondary-fixed p-8 pt-16 torn-edge-top mt-8">
        Torn top edge
      </div>

      {/* Button press */}
      <button className="border-2 border-primary bg-white px-6 py-3 font-epilogue font-bold uppercase shadow-hard btn-press">
        Press Me
      </button>

      {/* Offset rotations */}
      <div className="flex gap-8">
        <div className="w-24 h-24 bg-white border-2 border-primary shadow-hard offset-1 p-2 text-xs">offset-1</div>
        <div className="w-24 h-24 bg-white border-2 border-primary shadow-hard offset-2 p-2 text-xs">offset-2</div>
        <div className="w-24 h-24 bg-white border-2 border-primary shadow-hard offset-3 p-2 text-xs">offset-3</div>
      </div>

      {/* Dither filter */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="https://picsum.photos/300/200"
        alt="dither test"
        className="dither w-72"
      />
    </div>
  )
}
