class student:
    school_name = "superior college"
    def __init__(self,name,marks):
        self.name = name
        self.marks = marks
    def display(self):
        if self.marks>=80:
            grade = "A"
        elif self.marks>=70:
            grades = "B"
        elif self.marks>=60:
            grades = "C"
        else:
            grade = "D"
        print(self.name)
        print(self.marks)
        print(grades)
        print(self.school_name)
        s1 = student("ali",30)
        s1.display()
