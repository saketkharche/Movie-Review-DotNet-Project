
# 🎬 Movie Review Web Application (ASP.NET Core MVC)

Welcome to the **Movie Review Web Application** – a simple yet powerful project built using **ASP.NET Core MVC**, designed to manage and display movie reviews with CRUD operations. Whether you're a student learning ASP.NET or a developer looking to build a similar app, this project offers a great starting point!

## 🚀 Features

- 📝 **Add, Edit, Delete, and View** movie reviews
- 🎭 Store movie title, description, genre, rating, and release date
- 🗃️ Uses **Entity Framework Core** for data access
- 🎨 Clean and responsive UI using **Razor Views** and **Bootstrap**
- 🔍 Filtering and search functionality (basic)
- 💾 SQL Server database integration

## 🧰 Tech Stack

- **Framework**: ASP.NET Core MVC
- **Language**: C#
- **ORM**: Entity Framework Core
- **Database**: SQL Server
- **Frontend**: HTML5, CSS3, Bootstrap
- **IDE**: Visual Studio

## 📸 Screenshots

> _Screenshots can be added here for better visual context._
<p align="center">
  <img src="https://raw.githubusercontent.com/saketkharche/Movie-Review-DotNet-Project/refs/heads/master/Swagger.png" alt="Demo" width="600"/>
</p>

<p align="center">

  <img src="https://raw.githubusercontent.com/saketkharche/Movie-Review-DotNet-Project/refs/heads/master/Swagger.png" alt="Demo" width="600"/>

</p>
## 🏗️ Getting Started

Follow the steps below to get this project up and running on your local machine.

### Prerequisites

- [.NET 6 SDK or later](https://dotnet.microsoft.com/en-us/download)
- [Visual Studio 2022 or later](https://visualstudio.microsoft.com/)
- SQL Server or LocalDB

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/saketkharche/movie-review-dotnet-project.git
   cd movie-review-dotnet-project
   ```

2. **Update the database connection string**  
   Open `appsettings.json` and configure your SQL Server connection string.

3. **Apply Migrations and Create Database:**
   ```bash
   dotnet ef database update
   ```

4. **Run the application:**
   ```bash
   dotnet run
   ```

5. Open your browser and navigate to `https://localhost:5001` or the specified port.

## 📁 Project Structure

```
MovieReview/
├── Controllers/        # MVC Controllers
├── Models/             # Entity Models
├── Views/              # Razor Views
├── Data/               # Database Context
├── wwwroot/            # Static files
├── appsettings.json    # Configuration settings
└── Program.cs          # Entry point
```

## ✅ Future Improvements

- User authentication and authorization
- User-submitted reviews and comments
- Rating system and review analytics
- Responsive design enhancements

## 🙌 Acknowledgements

This project was created as part of a learning journey into ASP.NET Core MVC and Entity Framework Core.

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

Made with ❤️ by [@saketkharche](https://github.com/saketkharche)
```

---

Let me know if you'd like to add screenshots, badges, deployment instructions (e.g. Azure), or database diagrams!
