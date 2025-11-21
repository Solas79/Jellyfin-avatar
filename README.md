# Jellyfin-avatar
adds a js button to jellyfin for users to get more avatars
more then 3k

JavaScript injectior plugin is required!

https://github.com/n00bcodr/Jellyfin-JavaScript-Injector

This repository is based on the GitHub repository:

https://github.com/BobHasNoSoul/jellyfin-avatars

Instead of HTML, a JavaScript button is inserted.

Download all images from https://github.com/BobHasNoSoul/jellyfin-avatars 

and place them in the following directory (without subfolders):

/usr/share/jellyfin/web/avatars

or

/usr/share/jellyfin/webroot/avatars

without subfolders.

Create the file `list.json`.

This file must list all the videos.

No problem on Linux:

cd /usr/share/jellyfin/web/avatars
ls -l > list.json

or simply download it from here.

The file must be located in the folder /web/ or webroot.

If webroot you must change the script

Insert the code into JS injection.

This script was created with AI.
<img width="392" height="214" alt="Bildschirmfoto 2025-11-21 um 03 48 04" src="https://github.com/user-attachments/assets/8b1da31b-b67f-434b-87e8-08adf13b8604" />

<img width="1058" height="804" alt="Bildschirmfoto 2025-11-21 um 03 48 28" src="https://github.com/user-attachments/assets/14f1dabc-7e13-4a11-b2ae-fdd534105361" />
