export default function GloweeLogo() {
  return (
    <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border-2 border-white/80 bg-white p-0.5 shadow-sm">
      <img
        src="/Logo-sencillo.webp"
        alt="GLOWE BEAUTY Logo"
        className="h-full w-full rounded-full object-contain"
        onError={(e) => {
          e.currentTarget.onerror = null
          e.currentTarget.src = 'https://placehold.co/120x120/FDE2E4/FF758F?text=GLOWE'
        }}
      />
    </div>
  )
}
