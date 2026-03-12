#positional arguments
def greet(name, age):
    print(f"Hello {name}, you are {age} years old.")

greet("Ali", 25)  # Positional: name="Ali", age=25
#keyword argument
greet(age=25, name="Ali")  # Keyword: name="Ali", age=25
#default argument
def greet(name, age=18):
    print(f"Hello {name}, you are {age} years old.")
greet("Ali")        # Uses default age=18
greet("Sara", 22)   # Overrides default
#variable_length argument
#a. *arg(non keyword variable argument)
def add(*numbers):
    print(sum(numbers))

add(2, 3, 4)  # Output: 9
#b. kwargs(keyword arguments)
def show_details(**info):
    for key, value in info.items():
        print(f"{key}: {value}")

show_details(name="Ali", age=25, city="Lahore")

