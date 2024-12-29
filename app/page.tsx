export default function Home() {
  const redirectUri = encodeURIComponent('/inicio')
  return (
    <section className="flex flex-col md:flex-row items-center justify-center gap-8 py-12 md:py-16 bg-gradient-to-r from-light-500 to-gray-100 dark:from-dark-800 dark:to-gray-900 min-h-screen relative overflow-hidden">
      <div className="text-center md:text-left md:w-1/2 p-8 relative z-10">
        <h1 className="text-5xl font-bold text-light-900 dark:text-dark-100 mb-4">
          Bienvedino a MotorHub
        </h1>
        <p className="text-xl text-light-900 dark:text-dark-300 mb-6">
          Tu All-in-one para la gestión de tu local
        </p>
        <ul className="list-disc list-inside text-light-900 dark:text-dark-300 space-y-2"></ul>
      </div>
      <div className="flex flex-col items-center justify-center bg-light-100 dark:bg-dark-800 p-8 rounded-lg shadow-lg md:w-1/3 h-96 relative z-10">
        <h2 className="text-3xl font-semibold mb-4 dark:text-dark-100">
          Inicia sesión con Auth0
        </h2>
        <a
          href={`/api/auth/login?returnTo=${redirectUri}`}
          className="px-8 py-4 text-xl font-semibold text-light-100 bg-light-600 dark:bg-dark-700 rounded-lg shadow-lg hover:bg-light-700 dark:hover:bg-dark-800 focus:outline-none focus:ring-2 focus:ring-light-500 focus:ring-opacity-75 transition duration-300 ease-in-out"
        >
          Login
        </a>
      </div>
    </section>
  )
}
