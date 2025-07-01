"use client";

export default function AboutPage() {
  return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-violet-900 py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Header Section */}
          <header className="text-center mb-16">
            <h1 className="text-6xl md:text-7xl font-extrabold mb-6">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
              About Moviemo
            </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
              The gathering place for cinema lovers. Discover films, write reviews,
              and become part of our vibrant community!
            </p>
          </header>

          {/* Main Content */}
          <section className="grid gap-8 md:grid-cols-2">
            {/* Who We Are Card */}
            <div className="group relative overflow-hidden bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 shadow-xl hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <h2 className="text-3xl font-bold text-white mb-4 relative z-10">
                Who Are We?
              </h2>
              <p className="text-gray-300 leading-relaxed relative z-10">
                Moviemo is a platform where cinema lovers come together. Our goal is
                to enable film enthusiasts to discover their favorite films, write
                reviews, and exchange ideas with other movie buffs. Every movie
                tells a story; we're here so you can share yours.
              </p>
            </div>

            {/* Our Vision Card */}
            <div className="group relative overflow-hidden bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 shadow-xl hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <h2 className="text-3xl font-bold text-white mb-4 relative z-10">
                Our Vision
              </h2>
              <p className="text-gray-300 leading-relaxed relative z-10">
                We aim to make the world of cinema more accessible and interactive.
                Moviemo was designed as a user-focused platform that appeals to all
                kinds of film lovers. By combining technology and art, we strive to
                make your movie experience unforgettable.
              </p>
            </div>

            {/* Our Values Card */}
            <div className="group relative overflow-hidden bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 shadow-xl hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 md:col-span-2">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <h2 className="text-3xl font-bold text-white mb-6 relative z-10">
                Our Values
              </h2>
              <div className="grid md:grid-cols-2 gap-6 relative z-10">
                <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                  <h3 className="font-bold text-purple-400 mb-2">Community</h3>
                  <p className="text-gray-300">We bring film lovers together to build a strong community.</p>
                </div>
                <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                  <h3 className="font-bold text-purple-400 mb-2">Discovery</h3>
                  <p className="text-gray-300">We help you explore new movies and genres.</p>
                </div>
                <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                  <h3 className="font-bold text-purple-400 mb-2">Freedom</h3>
                  <p className="text-gray-300">We provide a space where everyone can freely share their opinions.</p>
                </div>
                <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                  <h3 className="font-bold text-purple-400 mb-2">Quality</h3>
                  <p className="text-gray-300">We offer a user-friendly experience and high-quality content.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Meet Our Team Section */}
          <section className="mt-20">
            <h2 className="text-4xl font-bold text-center text-white mb-12">
              Meet Our Team
            </h2>
            <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-3">
              {/* Team Member Card */}
              {[
                {
                  name: "Saket Kharche",
                  role: "Full Stack Developer",
                  bio: "Passionate about building scalable web apps and blending frontend creativity with backend logic.",
                  image: "https://i.ibb.co/Kj79Xm2j/saket.jpg "
                },
                {
                  name: "Nitu Patil",
                  role: "UI/UX Designer",
                  bio: "Creative thinker focused on crafting user-friendly and engaging designs for web and mobile applications.",
                  image: "https://i.ibb.co/Rk3Jpyjy/nitu.png "
                },
                {
                  name: "Rohit Pardesi",
                  role: "Backend Engineer",
                  bio: "Expert in building secure and optimized APIs, database schemas, and backend logic powering Moviemo.",
                  image: "https://i.ibb.co/LXqqwsDd/rohit.jpg "
                }
              ].map((member, index) => (
                  <div
                      key={index}
                      className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 text-center hover:bg-white/10 transition-all duration-300 transform hover:-translate-y-2"
                  >
                    <div className="relative w-36 h-36 mx-auto mb-6 rounded-full overflow-hidden border-4 border-purple-500/30 shadow-lg shadow-purple-500/20">
                      <img
                          src={member.image}
                          alt={member.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          onError={(e) => {
                            e.currentTarget.src = 'https://via.placeholder.com/300x300?text=Image+Not+Available';
                          }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end">
                        <div className="p-4 w-full">
                          <p className="text-white text-sm">{member.bio}</p>
                        </div>
                      </div>
                    </div>

                    <h3 className="text-2xl font-bold text-white mb-1">{member.name}</h3>
                    <p className="text-purple-400 font-medium mb-3">{member.role}</p>
                    <p className="text-gray-400 text-sm hidden md:block">{member.bio}</p>
                  </div>
              ))}
            </div>
          </section>

          {/* CTA Section */}
          <section className="mt-24 mb-12">
            <div className="relative overflow-hidden bg-gradient-to-r from-purple-900 via-indigo-900 to-blue-900 rounded-2xl p-8 md:p-12 text-center shadow-2xl border border-white/10">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 -mt-12 -mr-12 opacity-20">
                <svg className="w-48 h-48" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                </svg>
              </div>

              <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                Join the Moviemo Community!
              </h2>
              <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Sign up now, review your favorite movies, and connect with fellow film lovers.
              </p>
              <a
                  href="/signup"
                  className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
              >
                <span className="relative z-10">Join Now</span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 group-hover:opacity-30 rounded-lg transition-opacity"></div>
              </a>
            </div>
          </section>
        </div>
      </div>
  );
}