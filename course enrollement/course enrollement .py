# Gehirne Tech Academy - Student Management System

class Student:
    def __init__(self, name, course, fees, has_laptop, start_date):
        self.name = name
        self.course = course
        self.fees = fees
        self.has_laptop = has_laptop
        self.start_date = start_date
        self.leave_date = None
        self.attendance = {}  # date -> 'Present' or 'Absent'

    def mark_attendance(self, date, status):
        self.attendance[date] = status
        print(f"Attendance marked for {self.name} on {date}: {status}")

    def set_leave_date(self, leave_date):
        self.leave_date = leave_date
        print(f"{self.name} left the academy on {leave_date}")

    def show_details(self):
        print("\n" + "=" * 40)
        print(f"Student Name: {self.name}")
        print(f"Course: {self.course}")
        print(f"Fees Paid: Rs.{self.fees}")
        print(f"Has Own Laptop: {'Yes' if self.has_laptop else 'No'}")
        print(f"Start Date: {self.start_date}")
        print(f"Leave Date: {self.leave_date if self.leave_date else 'Still Enrolled'}")
        print("Attendance Record:")
        if self.attendance:
            for date, status in self.attendance.items():
                print(f"  {date}: {status}")
        else:
            print("  No attendance marked yet.")
        print("=" * 40)


class Academy:
    def __init__(self, name):
        self.name = name
        self.students = []
        self.courses = [
            "WordPress Development",
            "Frontend Development",
            "Graphic+Video Editing",
            "Social Media Marketing",
            "UI/UX Design",
            "Python Programming",
            "Basic Computer+Ms Office"
        ]

    def display_courses(self):
        print("\nAvailable Courses:")
        for i, course in enumerate(self.courses, 1):
            print(f"{i}. {course}")

    def add_course(self, course_name):
        if course_name not in self.courses:
            self.courses.append(course_name)
            print(f"Course '{course_name}' added successfully!")
        else:
            print(f"Course '{course_name}' already exists!")

    def remove_course(self, course_name):
        if course_name in self.courses:
            # Check if any student is enrolled in this course
            enrolled_students = [s for s in self.students if s.course == course_name]
            if enrolled_students:
                print(
                    f"Cannot remove '{course_name}'. {len(enrolled_students)} student(s) are enrolled in this course.")
                print("First remove or change the course for these students:")
                for student in enrolled_students:
                    print(f"  - {student.name}")
            else:
                self.courses.remove(course_name)
                print(f"Course '{course_name}' removed successfully!")
        else:
            print(f"Course '{course_name}' not found!")

    def enroll_student(self, name, course, fees, has_laptop, start_date):
        if course not in self.courses:
            print(f"Course '{course}' is not available!")
            print("Please choose from available courses.")
            return False

        student = Student(name, course, fees, has_laptop, start_date)
        self.students.append(student)
        print(f"\n{name} successfully enrolled in {course}!")
        return True

    def find_student(self, name):
        for student in self.students:
            if student.name.lower() == name.lower():
                return student
        print(f"Student '{name}' not found.")
        return None

    def mark_attendance_for_student(self, name, date, status):
        student = self.find_student(name)
        if student:
            student.mark_attendance(date, status)

    def set_student_leave(self, name, leave_date):
        student = self.find_student(name)
        if student:
            student.set_leave_date(leave_date)

    def show_all_students(self):
        if not self.students:
            print("\nNo students enrolled yet.")
            return
        print(f"\nAll Students in {self.name}:")
        for student in self.students:
            student.show_details()


# ------------------- MAIN PROGRAM -------------------
def main():
    academy = Academy("Gehirne Tech")

    while True:
        print("\n" + "=" * 40)
        print("GEHIRNE TECH ACADEMY - MENU")
        print("1. Enroll New Student")
        print("2. Mark Attendance")
        print("3. Set Student Leave Date")
        print("4. Show All Students")
        print("5. Manage Courses")
        print("6. Exit")
        print("=" * 40)

        choice = input("Enter your choice (1-6): ")

        if choice == '1':
            print("\n--- New Student Enrollment ---")
            name = input("Student Name: ")

            # Display available courses
            academy.display_courses()

            # Get course selection
            while True:
                course_choice = input("Enter course name exactly as shown above: ")
                if course_choice in academy.courses:
                    course = course_choice
                    break
                else:
                    print("Invalid course name! Please choose from the list above.")

            fees = int(input("Fees Paid (Rs.): "))
            laptop = input("Does student have own laptop? (yes/no): ").lower() == 'yes'
            start_date = input("Start Date (YYYY-MM-DD): ")
            academy.enroll_student(name, course, fees, laptop, start_date)

        elif choice == '2':
            print("\n--- Mark Attendance ---")
            name = input("Student Name: ")
            date = input("Date (YYYY-MM-DD): ")
            status = input("Status (Present/Absent): ").capitalize()
            if status in ['Present', 'Absent']:
                academy.mark_attendance_for_student(name, date, status)
            else:
                print("Invalid status! Use 'Present' or 'Absent'.")

        elif choice == '3':
            print("\n--- Set Leave Date ---")
            name = input("Student Name: ")
            leave_date = input("Leave Date (YYYY-MM-DD): ")
            academy.set_student_leave(name, leave_date)

        elif choice == '4':
            academy.show_all_students()

        elif choice == '5':
            print("\n--- Course Management ---")
            print("1. View All Courses")
            print("2. Add New Course")
            print("3. Remove Course")
            print("4. Back to Main Menu")

            sub_choice = input("Enter your choice (1-4): ")

            if sub_choice == '1':
                academy.display_courses()

            elif sub_choice == '2':
                new_course = input("Enter new course name: ").strip()
                if new_course:
                    academy.add_course(new_course)
                else:
                    print("Course name cannot be empty!")

            elif sub_choice == '3':
                academy.display_courses()
                course_to_remove = input("Enter course name to remove: ").strip()
                if course_to_remove:
                    academy.remove_course(course_to_remove)
                else:
                    print("Course name cannot be empty!")

            elif sub_choice == '4':
                continue

            else:
                print("Invalid choice!")

        elif choice == '6':
            print("\nThank you for using Gehirne Tech Academy System. Goodbye!")
            break

        else:
            print("Invalid choice. Please enter 1-6.")


if __name__ == "__main__":
    main()