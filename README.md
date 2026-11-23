# RuangBaca

RuangBaca adalah perpustakaan digital untuk koleksi PDF dan EPUB dalam repositori ini. Aplikasi dibuat dengan Next.js dan JavaScript.

## Struktur repositori

| Direktori | Isi |
| --- | --- |
| `apps/ruangbaca/` | Aplikasi Next.js dan konfigurasi Vercel |
| `ebook/pdf/` | Koleksi dan unggahan PDF |
| `ebook/epup/` | Koleksi dan unggahan EPUB dengan ekstensi `.epub` |

Untuk pengembangan lokal, gunakan Node.js 22.13 atau lebih baru.

```bash
cd apps/ruangbaca
npm ci
npm run dev
```

## Vercel

Hubungkan repositori ini ke Vercel dengan **Root Directory** `apps/ruangbaca`, framework **Next.js**, dan **Production Branch** `master`. Aktifkan **Skip deployment when there are no changes to the root directory or its dependencies**. Konfigurasi Ignored Build Step juga membandingkan revisi deployment sebelumnya dengan commit baru pada direktori aplikasi. Commit yang hanya mengubah koleksi ebook tidak perlu menjalankan build.

Tambahkan environment variable server-side berikut untuk Production.

| Variable | Nilai |
| --- | --- |
| `GITHUB_TOKEN` | Fine-grained PAT dengan akses hanya ke repositori `meimanjayagea/e-Books` dan izin **Contents: Read and write** |
| `EBOOK_UPLOAD_PASSWORD` | Kode admin acak dan kuat untuk mengotorisasi unggahan |
| `BLOB_READ_WRITE_TOKEN` | Token dari private Vercel Blob store yang terhubung ke proyek |

Deploy ulang setelah mengubah environment variable. Katalog publik bisa dibaca tanpa kredensial unggah. Unggah PDF atau EPUB hingga 50 MiB menggunakan kode admin. File transit di private Blob, lalu aplikasi membuat commit ke `master` dan menghapus file transit setelah diproses. File transit yang ditinggalkan kedaluwarsa otomatis. File yang sudah di-commit tersedia di repositori publik.

## Katalog e-Books

Koleksi 31 ebook ini dikelompokkan berdasarkan topik utama. File PDF disimpan di `ebook/pdf/` dan file EPUB di `ebook/epup/` dengan ekstensi `.epub`. Pembaca mengambil file PDF dan EPUB langsung dari revisi yang tercantum di `apps/ruangbaca/lib/ebook-source.js`. Daftar di bawah ini menaut ke file dalam repositori [e-Books](https://github.com/meimanjayagea/e-Books/tree/c9dbf63594ff50c5ccba781e19100e08d7939843).

### Arsitektur Perangkat Lunak

- [Clean Architecture: A Craftsman's Guide to Software Structure and Design](https://github.com/meimanjayagea/e-Books/blob/c9dbf63594ff50c5ccba781e19100e08d7939843/ebook/epup/Clean%20Architecture%20A%20Craftsman%27s%20Guide%20to%20-%20Robert%20C.%20Martin.epub) (EPUB)
- [Dependency Injection: Principles, Practices, and Patterns](https://github.com/meimanjayagea/e-Books/blob/c9dbf63594ff50c5ccba781e19100e08d7939843/ebook/epup/Dependency%20Injection%20-%20Principles%20Practices%20and%20Patterns%20-%20Steven%20van%20Deursen.epub) (EPUB)
- [Patterns of Enterprise Application Architecture](https://github.com/meimanjayagea/e-Books/blob/c9dbf63594ff50c5ccba781e19100e08d7939843/ebook/pdf/Patterns%20of%20Enterprise%20Application%20Architecture%20-%20Martin%20Fowler.pdf) (PDF)
- [Software Architecture in Practice (edisi ke-4)](https://github.com/meimanjayagea/e-Books/blob/c9dbf63594ff50c5ccba781e19100e08d7939843/ebook/pdf/software-architecture-in-practice-4.pdf) (PDF)
- [The Software Architect Elevator](https://github.com/meimanjayagea/e-Books/blob/c9dbf63594ff50c5ccba781e19100e08d7939843/ebook/epup/The-Software-Architect-Elevator-Gregor%20Hohpe.epub) (EPUB)

### Sistem Terdistribusi dan Data

- [Building Microservices](https://github.com/meimanjayagea/e-Books/blob/c9dbf63594ff50c5ccba781e19100e08d7939843/ebook/pdf/Sam%20Newman-Building%20Microservices-O%27Reilly%20Media%20%282015%29.pdf) (PDF)
- [Designing Data-Intensive Applications](https://github.com/meimanjayagea/e-Books/blob/c9dbf63594ff50c5ccba781e19100e08d7939843/ebook/pdf/Designing%20Data%20Intensive%20Applications.pdf) (PDF)

### Desain Berorientasi Objek dan Design Patterns

- [Design Patterns: Elements of Reusable Object-Oriented Software](https://github.com/meimanjayagea/e-Books/blob/c9dbf63594ff50c5ccba781e19100e08d7939843/ebook/epup/Design-patterns-elements-of-reusable-object-oriented-software-Erich-Gamma-Richard-Helm.epub) (EPUB)
- [Hands-On Design Patterns with Swift](https://github.com/meimanjayagea/e-Books/blob/c9dbf63594ff50c5ccba781e19100e08d7939843/ebook/pdf/Hands-On%20Design%20Patterns%20with%20Swift.pdf) (PDF)
- [Head First Design Patterns](https://github.com/meimanjayagea/e-Books/blob/c9dbf63594ff50c5ccba781e19100e08d7939843/ebook/pdf/%5BO%60Reilly.%20Head%20First%5D%20-%20Head%20First%20Design%20Patterns%20-%20%5BFreeman%5D.pdf) (PDF)
- [Head First Design Patterns (edisi ke-2)](https://github.com/meimanjayagea/e-Books/blob/c9dbf63594ff50c5ccba781e19100e08d7939843/ebook/pdf/Head_First_Design_Patterns_Building_Extensible_and_Maintainable_Object-Oriented_Software_2nd_Edition.pdf) (PDF)
- [Object-Oriented Analysis and Design with Applications (edisi ke-3)](https://github.com/meimanjayagea/e-Books/blob/c9dbf63594ff50c5ccba781e19100e08d7939843/ebook/pdf/Object.Oriented.Analysis.and.Design.with.Applications.3rd.Edition.by.Booch.pdf) (PDF)
- [Object-Oriented Software Construction](https://github.com/meimanjayagea/e-Books/blob/c9dbf63594ff50c5ccba781e19100e08d7939843/ebook/pdf/Object%20Oriented%20Software%20Construction-Meyer.pdf) (PDF)

### Kualitas Kode dan Refactoring

- [Clean Code Collection](https://github.com/meimanjayagea/e-Books/blob/c9dbf63594ff50c5ccba781e19100e08d7939843/ebook/epup/Clean%20Code%20Collection%20-%20Robert%20C.%20Martin.epub) (EPUB)
- [Five Lines of Code: How and When to Refactor](https://github.com/meimanjayagea/e-Books/blob/c9dbf63594ff50c5ccba781e19100e08d7939843/ebook/epup/Five%20Lines%20of%20Code_%20How%20and%20when%20to%20refactor.epub) (EPUB)
- [Refactoring: Improving the Design of Existing Code](https://github.com/meimanjayagea/e-Books/blob/c9dbf63594ff50c5ccba781e19100e08d7939843/ebook/epup/Refactoring%20Improving%20the%20Design%20of%20Existing%20Code.epub) (EPUB)

### Pengujian dan Test-Driven Development

- [Growing Object-Oriented Software, Guided by Tests](https://github.com/meimanjayagea/e-Books/blob/c9dbf63594ff50c5ccba781e19100e08d7939843/ebook/pdf/Growing%20Object-Oriented%20Software%2C%20Guided%20by%20Tests.pdf) (PDF)
- [Test-Driven Development: By Example](https://github.com/meimanjayagea/e-Books/blob/c9dbf63594ff50c5ccba781e19100e08d7939843/ebook/pdf/Test-Driven%20Development%20By%20Example%20%28Kent%20Beck%29.pdf) (PDF)

### Pemodelan Domain dan Kebutuhan

- [Domain-Driven Design: Tackling Complexity in the Heart of Software](https://github.com/meimanjayagea/e-Books/blob/c9dbf63594ff50c5ccba781e19100e08d7939843/ebook/pdf/Domain%20Driven%20Design%20Tackling%20Complexity%20in%20the%20Heart%20of%20Software%20-%20Eric%20Evans.pdf) (PDF)
- [Object-Oriented Software Engineering: A Use Case Driven Approach](https://github.com/meimanjayagea/e-Books/blob/c9dbf63594ff50c5ccba781e19100e08d7939843/ebook/pdf/Ivar_Jacobson_Object_oriented_software_engineering_a_use_case_driven_approach%281992%29.pdf) (PDF)
- [Use-Case 2.0](https://github.com/meimanjayagea/e-Books/blob/c9dbf63594ff50c5ccba781e19100e08d7939843/ebook/pdf/use-case_2.0_final_rev3.pdf) (PDF)
- [User Stories Applied](https://github.com/meimanjayagea/e-Books/blob/c9dbf63594ff50c5ccba781e19100e08d7939843/ebook/pdf/User-Stories-Applied-Mike-Cohn.pdf) (PDF)
- [Writing Effective Use Cases](https://github.com/meimanjayagea/e-Books/blob/c9dbf63594ff50c5ccba781e19100e08d7939843/ebook/pdf/Writing%20Effective%20Use%20Cases.pdf) (PDF)

### Agile dan Extreme Programming

- [Agile Software Development](https://github.com/meimanjayagea/e-Books/blob/c9dbf63594ff50c5ccba781e19100e08d7939843/ebook/pdf/Agile%20Software%20Development.pdf) (PDF)
- [Extreme Programming Explained: Embrace Change (edisi ke-2)](https://github.com/meimanjayagea/e-Books/blob/c9dbf63594ff50c5ccba781e19100e08d7939843/ebook/pdf/Extreme-programming-explained-embrace-change-2.pdf) (PDF)

### Dasar Rekayasa Perangkat Lunak dan Pemrograman

- [Software Design Decoded: 66 Ways Experts Think](https://github.com/meimanjayagea/e-Books/blob/c9dbf63594ff50c5ccba781e19100e08d7939843/ebook/pdf/Software-design-decoded-66-ways-experts-think.pdf) (PDF)
- [Software Engineering: A Practitioner's Approach](https://github.com/meimanjayagea/e-Books/blob/c9dbf63594ff50c5ccba781e19100e08d7939843/ebook/epup/Software-engineering-a-practitioners-approach.epub) (EPUB)
- [Structure and Interpretation of Computer Programs](https://github.com/meimanjayagea/e-Books/blob/c9dbf63594ff50c5ccba781e19100e08d7939843/ebook/pdf/sicp.pdf) (PDF)
- [The Essentials of Modern Software Engineering](https://github.com/meimanjayagea/e-Books/blob/c9dbf63594ff50c5ccba781e19100e08d7939843/ebook/epup/the-essentials-of-modern-software-engineering-free-the-practices-from-the-method-prisons.epub) (EPUB)
- [The Pragmatic Programmer: Your Journey to Mastery (edisi ulang tahun ke-20)](https://github.com/meimanjayagea/e-Books/blob/c9dbf63594ff50c5ccba781e19100e08d7939843/ebook/pdf/The%20Pragmatic%20Programmer%20Your%20Journey%20to%20Mastery%2C%2020th%20Anniversary%20Edition%20by%20Andrew%20Hunt%20David%20Hurst%20Thomas.pdf) (PDF)
- [We Programmers: A Chronicle of Coders from Ada to AI](https://github.com/meimanjayagea/e-Books/blob/c9dbf63594ff50c5ccba781e19100e08d7939843/ebook/pdf/We_Programmers_A_Chronicle_of_Coders_from_Ada_to_AI.pdf) (PDF)
