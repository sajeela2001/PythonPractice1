print("SELECT OPERATION")
print("+ Addition")
print("- Subtraction")
print("* Multiplication")
print("/ Division")
print("**Power")
print("% Modulus")
Choice = input("Enter your Choice: ")
n1= float(input("Enter n1:"))
n2= float(input("Enter n2:"))
if Choice=="+":
        ans = n1+n2
        print ("ans = ",ans)
elif Choice=="-":
        ans = n1-n2
        print("ans =",ans)
elif Choice=="/":
        ans = n1/n2
        print ("ans = ",ans)
elif Choice=="**":
        ans = n1**n2
        print ("ans = ",ans)
elif Choice=="%":
        ans = n1%n2
        print ("ans = ",ans)