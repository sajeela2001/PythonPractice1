secret_number = 8
guess = int(input('guess the number'))
while guess != secret_number:
    if  guess!= secret_number:
        print('too close! try next time')
        guess = int(input('guess again'))
    if guess== secret_number:
        print ('you guessed right')

