package com.college.lostfound.config;

import com.college.lostfound.model.Item;
import com.college.lostfound.model.Student;
import com.college.lostfound.repository.ItemRepository;
import com.college.lostfound.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private ItemRepository itemRepository;

    @Override
    public void run(String... args) throws Exception {
        if (studentRepository.count() == 0) {
            // Seed Admin
            Student admin = new Student("ADMIN001", "Campus Admin", "admin@college.edu", "admin123", "Administration", "1234567890", true);
            studentRepository.save(admin);

            // Seed Students
            Student alice = new Student("S1001", "Alice Smith", "alice@college.edu", "password123", "Computer Science", "9876543210", false);
            Student bob = new Student("S1002", "Bob Johnson", "bob@college.edu", "password123", "Electrical Engineering", "9876543211", false);
            Student charlie = new Student("S1003", "Charlie Brown", "charlie@college.edu", "password123", "Mechanical Engineering", "9876543212", false);
            studentRepository.save(alice);
            studentRepository.save(bob);
            studentRepository.save(charlie);

            // Seed Lost Items
            Item item1 = new Item("iPhone 13 Pro", "Midnight blue color, has a clear case with a sticker of a rocket. Left it on a desk in Lab 3.", "Electronics", "LOST", "CS Department Lab 3", LocalDate.now().minusDays(2), null, "APPROVED", "Contact via email or phone", alice);
            Item item2 = new Item("Leather Wallet", "Brown leather wallet containing a college ID card and some cash. Probably dropped near canteen.", "Documents", "LOST", "Campus Canteen", LocalDate.now().minusDays(1), null, "APPROVED", "Call 9876543211", bob);
            itemRepository.save(item1);
            itemRepository.save(item2);

            // Seed Found Items
            Item item3 = new Item("Keys with Deadpool Keychain", "Found a set of keys with a Deadpool keychain on a bench outside the library.", "Keys", "FOUND", "Library Bench", LocalDate.now(), null, "APPROVED", "Found it at 10 AM, handed to library desk", charlie);
            Item item4 = new Item("Calculus Textbook", "Calculus: Early Transcendentals by Stewart. Left on a table in the library, 2nd floor.", "Books", "FOUND", "Library 2nd Floor", LocalDate.now().minusDays(3), null, "APPROVED", "Contact email", bob);
            itemRepository.save(item3);
            itemRepository.save(item4);

            System.out.println("Database seeding completed successfully!");
        }
    }
}
