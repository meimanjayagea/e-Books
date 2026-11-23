# RuangBaca

RuangBaca adalah perpustakaan digital untuk koleksi PDF dan EPUB dalam repositori ini. Aplikasi dibuat dengan Next.js dan JavaScript.

## Menjalankan aplikasi

Gunakan Node.js 22.13 atau lebih baru. Jalankan perintah berikut dari direktori repositori.

```bash
npm ci
npm run dev
```

Buka `http://localhost:3000` di browser. Jalankan `npm run build` untuk menghasilkan situs statis di `out/` yang siap dipublikasikan melalui Sites.

Cari judul atau penulis, pilih kategori, lalu klik sampul untuk membaca. Pembaca mendukung tombol panah kiri dan kanan, daftar isi jika tersedia, zoom atau ukuran teks, dan mode gelap. Tampilan dua halaman tersedia di layar lebar. Buku tersimpan dan posisi baca disimpan di browser yang digunakan.

## Katalog e-Books

Koleksi 31 ebook ini dikelompokkan berdasarkan topik utama. Pembaca mengambil file PDF dan EPUB langsung dari revisi yang tercantum di `lib/ebook-file.js`. Daftar di bawah ini menaut ke file dalam repositori [e-Books](https://github.com/meimanjayagea/e-Books/tree/d5594cea78b9af2768550bba70cebe67e7c1fcda).

### Arsitektur Perangkat Lunak

- [Clean Architecture: A Craftsman's Guide to Software Structure and Design](https://github.com/meimanjayagea/e-Books/blob/d5594cea78b9af2768550bba70cebe67e7c1fcda/Clean%20Architecture%20A%20Craftsman%27s%20Guide%20to%20-%20Robert%20C.%20Martin.epub) (EPUB)
- [Dependency Injection: Principles, Practices, and Patterns](https://github.com/meimanjayagea/e-Books/blob/d5594cea78b9af2768550bba70cebe67e7c1fcda/Dependency%20Injection%20-%20Principles%20Practices%20and%20Patterns%20-%20Steven%20van%20Deursen.epub) (EPUB)
- [Patterns of Enterprise Application Architecture](https://github.com/meimanjayagea/e-Books/blob/d5594cea78b9af2768550bba70cebe67e7c1fcda/Patterns%20of%20Enterprise%20Application%20Architecture%20-%20Martin%20Fowler.pdf) (PDF)
- [Software Architecture in Practice (edisi ke-4)](https://github.com/meimanjayagea/e-Books/blob/d5594cea78b9af2768550bba70cebe67e7c1fcda/software-architecture-in-practice-4.pdf) (PDF)
- [The Software Architect Elevator](https://github.com/meimanjayagea/e-Books/blob/d5594cea78b9af2768550bba70cebe67e7c1fcda/The-Software-Architect-Elevator-Gregor%20Hohpe.epub) (EPUB)

### Sistem Terdistribusi dan Data

- [Building Microservices](https://github.com/meimanjayagea/e-Books/blob/d5594cea78b9af2768550bba70cebe67e7c1fcda/Sam%20Newman-Building%20Microservices-O%27Reilly%20Media%20%282015%29.pdf) (PDF)
- [Designing Data-Intensive Applications](https://github.com/meimanjayagea/e-Books/blob/d5594cea78b9af2768550bba70cebe67e7c1fcda/Designing%20Data%20Intensive%20Applications.pdf) (PDF)

### Desain Berorientasi Objek dan Design Patterns

- [Design Patterns: Elements of Reusable Object-Oriented Software](https://github.com/meimanjayagea/e-Books/blob/d5594cea78b9af2768550bba70cebe67e7c1fcda/Design-patterns-elements-of-reusable-object-oriented-software-Erich-Gamma-Richard-Helm.epub) (EPUB)
- [Hands-On Design Patterns with Swift](https://github.com/meimanjayagea/e-Books/blob/d5594cea78b9af2768550bba70cebe67e7c1fcda/Hands-On%20Design%20Patterns%20with%20Swift.pdf) (PDF)
- [Head First Design Patterns](https://github.com/meimanjayagea/e-Books/blob/d5594cea78b9af2768550bba70cebe67e7c1fcda/%5BO%60Reilly.%20Head%20First%5D%20-%20Head%20First%20Design%20Patterns%20-%20%5BFreeman%5D.pdf) (PDF)
- [Head First Design Patterns (edisi ke-2)](https://github.com/meimanjayagea/e-Books/blob/d5594cea78b9af2768550bba70cebe67e7c1fcda/Head_First_Design_Patterns_Building_Extensible_and_Maintainable_Object-Oriented_Software_2nd_Edition.pdf) (PDF)
- [Object-Oriented Analysis and Design with Applications (edisi ke-3)](https://github.com/meimanjayagea/e-Books/blob/d5594cea78b9af2768550bba70cebe67e7c1fcda/Object.Oriented.Analysis.and.Design.with.Applications.3rd.Edition.by.Booch.pdf) (PDF)
- [Object-Oriented Software Construction](https://github.com/meimanjayagea/e-Books/blob/d5594cea78b9af2768550bba70cebe67e7c1fcda/Object%20Oriented%20Software%20Construction-Meyer.pdf) (PDF)

### Kualitas Kode dan Refactoring

- [Clean Code Collection](https://github.com/meimanjayagea/e-Books/blob/d5594cea78b9af2768550bba70cebe67e7c1fcda/Clean%20Code%20Collection%20-%20Robert%20C.%20Martin.epub) (EPUB)
- [Five Lines of Code: How and When to Refactor](https://github.com/meimanjayagea/e-Books/blob/d5594cea78b9af2768550bba70cebe67e7c1fcda/Five%20Lines%20of%20Code_%20How%20and%20when%20to%20refactor.epub) (EPUB)
- [Refactoring: Improving the Design of Existing Code](https://github.com/meimanjayagea/e-Books/blob/d5594cea78b9af2768550bba70cebe67e7c1fcda/Refactoring%20Improving%20the%20Design%20of%20Existing%20Code.epub) (EPUB)

### Pengujian dan Test-Driven Development

- [Growing Object-Oriented Software, Guided by Tests](https://github.com/meimanjayagea/e-Books/blob/d5594cea78b9af2768550bba70cebe67e7c1fcda/Growing%20Object-Oriented%20Software%2C%20Guided%20by%20Tests.pdf) (PDF)
- [Test-Driven Development: By Example](https://github.com/meimanjayagea/e-Books/blob/d5594cea78b9af2768550bba70cebe67e7c1fcda/Test-Driven%20Development%20By%20Example%20%28Kent%20Beck%29.pdf) (PDF)

### Pemodelan Domain dan Kebutuhan

- [Domain-Driven Design: Tackling Complexity in the Heart of Software](https://github.com/meimanjayagea/e-Books/blob/d5594cea78b9af2768550bba70cebe67e7c1fcda/Domain%20Driven%20Design%20Tackling%20Complexity%20in%20the%20Heart%20of%20Software%20-%20Eric%20Evans.pdf) (PDF)
- [Object-Oriented Software Engineering: A Use Case Driven Approach](https://github.com/meimanjayagea/e-Books/blob/d5594cea78b9af2768550bba70cebe67e7c1fcda/Ivar_Jacobson_Object_oriented_software_engineering_a_use_case_driven_approach%281992%29.pdf) (PDF)
- [Use-Case 2.0](https://github.com/meimanjayagea/e-Books/blob/d5594cea78b9af2768550bba70cebe67e7c1fcda/use-case_2.0_final_rev3.pdf) (PDF)
- [User Stories Applied](https://github.com/meimanjayagea/e-Books/blob/d5594cea78b9af2768550bba70cebe67e7c1fcda/User-Stories-Applied-Mike-Cohn.pdf) (PDF)
- [Writing Effective Use Cases](https://github.com/meimanjayagea/e-Books/blob/d5594cea78b9af2768550bba70cebe67e7c1fcda/Writing%20Effective%20Use%20Cases.pdf) (PDF)

### Agile dan Extreme Programming

- [Agile Software Development](https://github.com/meimanjayagea/e-Books/blob/d5594cea78b9af2768550bba70cebe67e7c1fcda/Agile%20Software%20Development.pdf) (PDF)
- [Extreme Programming Explained: Embrace Change (edisi ke-2)](https://github.com/meimanjayagea/e-Books/blob/d5594cea78b9af2768550bba70cebe67e7c1fcda/Extreme-programming-explained-embrace-change-2.pdf) (PDF)

### Dasar Rekayasa Perangkat Lunak dan Pemrograman

- [Software Design Decoded: 66 Ways Experts Think](https://github.com/meimanjayagea/e-Books/blob/d5594cea78b9af2768550bba70cebe67e7c1fcda/Software-design-decoded-66-ways-experts-think.pdf) (PDF)
- [Software Engineering: A Practitioner's Approach](https://github.com/meimanjayagea/e-Books/blob/d5594cea78b9af2768550bba70cebe67e7c1fcda/Software-engineering-a-practitioners-approach.epub) (EPUB)
- [Structure and Interpretation of Computer Programs](https://github.com/meimanjayagea/e-Books/blob/d5594cea78b9af2768550bba70cebe67e7c1fcda/sicp.pdf) (PDF)
- [The Essentials of Modern Software Engineering](https://github.com/meimanjayagea/e-Books/blob/d5594cea78b9af2768550bba70cebe67e7c1fcda/the-essentials-of-modern-software-engineering-free-the-practices-from-the-method-prisons.epub) (EPUB)
- [The Pragmatic Programmer: Your Journey to Mastery (edisi ulang tahun ke-20)](https://github.com/meimanjayagea/e-Books/blob/d5594cea78b9af2768550bba70cebe67e7c1fcda/The%20Pragmatic%20Programmer%20Your%20Journey%20to%20Mastery%2C%2020th%20Anniversary%20Edition%20by%20Andrew%20Hunt%20David%20Hurst%20Thomas.pdf) (PDF)
- [We Programmers: A Chronicle of Coders from Ada to AI](https://github.com/meimanjayagea/e-Books/blob/d5594cea78b9af2768550bba70cebe67e7c1fcda/We_Programmers_A_Chronicle_of_Coders_from_Ada_to_AI.pdf) (PDF)
