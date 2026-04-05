class Employee:
    company = "ABC Ltd"

    def __init__(self, name, salary):
        self.name = name
        self.salary = salary

    def show(self):
        print("Name:", self.name)
        print("Salary:", self.salary)
        print("Company:", Employee.company)

    @classmethod
    def change_company(cls, new_name):
        cls.company = new_name

# objects
e1 = Employee("Ali", 50000)

e1.show()
print("---- After Change ----")

Employee.change_company("XYZ Ltd")
e1.show()