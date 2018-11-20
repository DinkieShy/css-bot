# css-bot
Bot for the University of Lincoln Computer Science Society discord


### Features

- [x] !poll
- [x] !changerole
- [x] !studentfinance
- [ ] !timer
- [ ] !remind

## !poll
`!poll option1 option2`  
Send a message afterwards with the current scores ranked in order of votes. Get votes by reactions

## !changerole
`!changerole first-year`  
Changes current users role to the requested role, can only be changed to specified roles.

## !studentfinance
`!studentfinance`  
Print the date of the next student finance payment and the time left from https://studentfinancecountdown.com

## !timer
`!timer [end time] [reminder interval]`  
Pings a reminder with time left every [reminder interval] until [end time]. [end time] could be many formats (dd/mm/yy or hours:minutes etc.) so need to overload !timer function (limit to css-comittee role)

## !remind
`!remind`  
Ping users that react with certain emoji in DM to remind of an event (css-comittee role can remind everyone that reacted but non css-comittee can only remind themselves)
