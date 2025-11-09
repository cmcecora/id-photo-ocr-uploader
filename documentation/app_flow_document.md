# App Flow Document for ID Photo Upload & AI Text Extraction Tool

## Onboarding and Sign-In/Sign-Up

When a new user arrives at the application, they land on a simple welcome page that introduces the ID scanning tool and prompts them to get started. There is no formal sign-up or password process in this version of the app; users simply click the “Start Scanning” button or link to enter the main interface. Because there is no account system, there is also no sign-in, sign-out, or password recovery flow to navigate. The user can bookmark the URL or reload the page at any time to return to the tool.

## Main Dashboard or Home Page

Once the user chooses to start scanning, they are taken to the main ID Scanner page. At the top, a header displays the application name and a link back to the landing page. Below the header, the screen is divided into two columns. On the left side, the Upload Panel invites the user to drag and drop or click to select an image file. On the right side, the Data Form sits empty and disabled until an image has been processed. A global toast notification area is available in the corner for error and success messages. Navigation between landing and scanner pages is handled by simple links in the header.

## Detailed Feature Flows and Page Transitions

When the user drags an image file onto the Upload Panel or selects it manually, the application immediately checks the file type and size. If the file is valid, a thumbnail preview appears in the panel. The application then sends the image in a multipart POST request to the server endpoint `/api/id/upload`. While awaiting the server response, a loading spinner overlays the upload area. When the server returns extracted text data, the form on the right populates automatically with fields such as ID number, first name, last name, date of birth, and address. The form controls unlock and display “Edit” and “Save” buttons.

If the user clicks “Edit,” all input fields become active so they can correct or refine any extracted data. Once the data is satisfactory, clicking “Save” triggers another POST request to `/api/id/save` on the backend, which persists the data to the database. Upon successful save, a success toast appears and the form locks again, preventing further changes until the user initiates another upload or page reload. If the user wishes to scan another ID, they can replace the file in the Upload Panel or click the header link to reset the page.

## Settings and Account Management

This application does not support user accounts or personal settings within the interface. Instead, any configuration—such as the backend URL or the API key for the OCR service—resides in the `.env` file managed by the development or deployment environment. To adjust these values, a developer needs to update the environment variables and restart the app. Returning to the main scanning flow simply involves reloading the page or clicking the header link back to the scanner.

## Error States and Alternate Paths

If the user selects a file that exceeds the maximum allowed size or is not an image, the Upload Panel immediately rejects it and a descriptive error toast explains the problem. No upload request is sent in that case. If the network connection is lost during upload or when saving edited data, the application displays an error toast indicating a connectivity issue and suggests retrying. If the backend returns an error response—for instance, if the OCR service fails or the save operation is rejected—the error message from the server appears in a toast and the form or upload area resets to its previous stable state, allowing the user to attempt the action again.

## Conclusion and Overall App Journey

In summary, the user experience begins on a clear landing page with a single action to start scanning. From there, they work entirely on the ID Scanner page, where uploading an image triggers OCR extraction and automatic form population. They refine data in an editable form and then save it to the database. Throughout the process, the app provides real-time validation, loading indicators, and friendly toast messages to guide the user. This straightforward flow allows someone to quickly and reliably upload ID photos, extract text via AI, correct the results, and store the final data with minimal friction.