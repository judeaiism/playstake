X Developers
Twitter card doesn’t show image due to robots.txt blocking
Publisher Tools
Cards

Log In
​
​
​
Basic and Pro developers can now purchase a cap increase to GET more posts (FKA Tweets) via the X API v2. Read our announcement for more info.
Twitter card doesn’t show image due to robots.txt blocking
Publisher Tools
Cards
Jun 20
Jul 12
 
thangph99469653
Jun 20
https:// content. elecktra. net/ 2024 /06 /04 /omnis-autem-et-recusandae/

When validating the card using twitter card validation I get the error:

ERROR: Fetching the page failed because it's denied by robots.txt.

The robots.txt can be seen https:// content. elecktra .net /robots.txt

I don’t know if it is a problem of an old cached robots.txt on Twitter or something else.

Thank you for any help!




535
views

Mohitems
Jun 28
Check Your robots.txt:
Access your website’s control panel or file manager.
Locate the robots.txt file (usually in the root directory).
Look for lines starting with “Disallow:”. These specify what crawlers can’t access.
Identify Blocking Rule:
If you see a rule like “Disallow: /images” (blocking the entire images folder), that’s the culprit.
More specific rules might block subfolders containing the image (e.g., “Disallow: /user/images”).
Adjust the Rule (2 Options):
Option 1: Allow Access to Image Folder (Recommended):
If possible, edit the rule to allow access only to the folder containing the Twitter card image.
For example, change “Disallow: /images” to “Disallow: /images/private” (assuming private images are not for Twitter cards).
Option 2: Allow Twitterbot Specifically (Less Secure):
Add a line like “Allow: /path/to/your/image.jpg” (replace with your actual path).
Caution: This allows access to a specific image, which might not be ideal for security reasons.
Save and Re-upload robots.txt:
After making changes, save the robots.txt file.
Re-upload it to your website’s root directory.
Test and Wait:
Use the dev twitter website" to test your Twitter card again.
It might take some time (a few hours) for Twitter to recrawl your site and update the card.
check this Website for Professional tips on twitter search digitally360 dot com



--------


https://www.opengraph.xyz/url/https%3A%2F%2Fplaysstakes.com

OpenGraph
OpenGraph
AboutBlogInspirationFAQDashboard
THE EASIEST WAY TO
Preview and Generate Open Graph Meta Tags
Website

Check Website
Edit
Customize how your content appears on search engines and social platforms. Modify the title, description, and image to optimize visibility and engagement.

Title

Recommended: 60 characters
Description

Recommended: 155 - 160 characters
Image

Choose OG Image Template
NEW FEATURE
OR

Change Image
Recommended: 1200x630px
Copy
Copy the HTML meta tags for your site. Insert these tags in your site's head section for improved social sharing and SEO.

NEW: Automate Your Open Graph Images
Efficiently generate stylish Open Graph images with our tool. Choose a template and instantly create consistent, engaging visuals for social media!
<!-- HTML Meta Tags -->
<title>Play$Stakes - Ultimate Gaming & Staking</title>
<meta name="description" content="Join Play$Stakes for an exciting gaming and staking experience. The ultimate platform combining gaming and cryptocurrency staking.">

<!-- Facebook Meta Tags -->
<meta property="og:url" content="https://playsstakes.com">
<meta property="og:type" content="website">
<meta property="og:title" content="Play$Stakes - Ultimate Gaming & Staking">
<meta property="og:description" content="Join Play$Stakes for an exciting gaming and staking experience. The ultimate platform combining gaming and cryptocurrency staking.">
<meta property="og:image" content="http://localhost:3000/images/og-image.jpg?v=1726858826974">

<!-- Twitter Meta Tags -->
<meta name="twitter:card" content="summary_large_image">
<meta property="twitter:domain" content="playsstakes.com">
<meta property="twitter:url" content="https://playsstakes.com">
<meta name="twitter:title" content="Play$Stakes - Ultimate Gaming & Staking">
<meta name="twitter:description" content="Join Play$Stakes for an exciting gaming and staking experience. The ultimate platform combining gaming and cryptocurrency staking.">
<meta name="twitter:image" content="http://localhost:3000/images/og-image.jpg?v=1726858826974">

<!-- Meta Tags Generated via https://www.opengraph.xyz -->

Copy To Clipboard
Preview
See how your website will look on social media platforms. This live preview ensures your metadata aligns with your content and branding.

FACEBOOK


PLAYSSTAKES.COM
X (FORMERLY TWITTER)


playsstakes.com
LINKEDIN


DISCORD

Play$Stakes
Play$Stakes - Ultimate Gaming & Staking
Join Play$Stakes for an exciting gaming and staking experience. The ultimate platform combining gaming and cryptocurrency staking.
Play$Stakes - Ultimate Gaming & Staking
OpenGraph - Preview Social Media Share and Generate Metatags - OpenGraph

