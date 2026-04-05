class BankAccount:
    def __init__(self, name, balance):
        self.name = name
        self.balance = balance

    def deposit(self, amount):
        self.balance += amount
        print("Deposited:", amount)

    def withdraw(self, amount):
        if amount <= self.balance:
            self.balance -= amount
            print("Withdrawn:", amount)
        else:
            print("Insufficient balance")

    @staticmethod
    def min_balance(balance):
        if balance >= 1000:
            print("Balance is OK")
        else:
            print("Minimum balance required!")

# object
b1 = BankAccount("Ali", 1500)

b1.deposit(500)
b1.withdraw(700)

print("Current Balance:", b1.balance)

BankAccount.min_balance(b1.balance)