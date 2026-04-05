class Student:
    school = "ABC School"   # class variable

    def __init__(self, name, marks):
        self.name = name
        self.marks = marks

    def display(self):
        print("Name:", self.name)
        print("Marks:", self.marks)
        print("School:", Student.school)

# objects
s1 = Student("Ali", 85)
s2 = Student("Sara", 92)

s1.display()
print("------")
s2.display()