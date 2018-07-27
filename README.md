# Real-Time Collaborative Rich Text Editor 

Main Functionality

This app, based on the basic premise of google docs, is an electron real-time text editor that uses socket.io 
to track changes to documents and share them across users. 

Built mainly for practicing the integration of knowledge of a node backend server, React frontend and Draft.JS 
to build a rich text editor

Specifications

1) Rich Text Editor:  Allows for styling of the document (bold, italics, underlining), changing font size, and
changing the text color. There is also search functionality implemented to allow the user to search for a 
specific word or phrase within the document. 

2) Collaboration: Once a document is created, the owner can invite people to join the document by sending them 
a document ID. The recipient can add the document to their editing page by entering this ID and clicking 'join'

3) Socket.io Integration: The use of web sockets allows for the collaborators to see the changes that other users 
make in real time, and track the position of their cursor as well as any highlights they might make. Up to six users
are allowed to join a given document, and each user is assigned a color upon entering the collaboration. 
