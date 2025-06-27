"use client";

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      {/* Header Section */}
      <header className="text-center mb-12">
        <h1 className="text-5xl font-extrabold text-gray-900 mb-4 bg-gradient-to-r from-blue-500 to-purple-600 text-transparent bg-clip-text">
          About Moviemo
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          The gathering place for cinema lovers. Discover films, write reviews,
          and become part of our community!
        </p>
      </header>

      {/* Main Content */}
      <section className="grid gap-8 md:grid-cols-2">
        {/* Who We Are Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-transform duration-300">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Who Are We?
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Moviemo is a platform where cinema lovers come together. Our goal is
            to enable film enthusiasts to discover their favorite films, write
            reviews, and exchange ideas with other movie buffs. Every movie
            tells a story; we’re here so you can share yours.
          </p>
        </div>

        {/* Our Vision Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-transform duration-300">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Our Vision
          </h2>
          <p className="text-gray-600 leading-relaxed">
            We aim to make the world of cinema more accessible and interactive.
            Moviemo was designed as a user-focused platform that appeals to all
            kinds of film lovers. By combining technology and art, we strive to
            make your movie experience unforgettable.
          </p>
        </div>

        {/* Our Values Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-transform duration-300 md:col-span-2">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Our Values
          </h2>
          <ul className="list-disc list-inside text-gray-600 space-y-2">
            <li>
              <span className="font-medium">Community:</span> We bring film
              lovers together to build a strong community.
            </li>
            <li>
              <span className="font-medium">Discovery:</span> We help you
              explore new movies and genres.
            </li>
            <li>
              <span className="font-medium">Freedom:</span> We provide a space
              where everyone can freely share their opinions.
            </li>
            <li>
              <span className="font-medium">Quality:</span> We offer a
              user-friendly experience and high-quality content.
            </li>
          </ul>
        </div>
      </section>

      {/* Call to Action (CTA) */}
      <section className="mt-12 text-center">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-8 text-white">
          <h2 className="text-3xl font-bold mb-4">
            Join the Moviemo Community!
          </h2>
          <p className="text-lg mb-6">
            Sign up now, review your favorite movies, and connect with fellow
            film lovers.
          </p>
          <a
            href="/signup"
            className="inline-block bg-white text-blue-600 font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Join Now
          </a>
        </div>
      </section>
    </div>
  );
}
