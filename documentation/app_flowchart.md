flowchart TD
    StartIDScannerPage[User opens IDScannerPage]
    StartIDScannerPage --> SelectFile[User selects file in UploadPanel]
    SelectFile --> ValidateFile{File valid}
    ValidateFile -->|No| ShowError[Show validation error]
    ValidateFile -->|Yes| UploadMutation[Trigger upload mutation]
    UploadMutation --> ShowLoading[Show loading spinner]
    UploadMutation --> ReceiveResponse[Receive OCR response]
    ReceiveResponse --> PopulateForm[Populate DataForm with extracted data]
    PopulateForm --> EditDecision{User clicks EDIT}
    EditDecision -->|Yes| EnableFields[Enable form fields]
    EditDecision -->|No| ReadOnlyMode[Form remains read only]
    EnableFields --> UserEdits[User edits data]
    UserEdits --> ClickSave[Click SAVE]
    ClickSave --> SaveMutation[Trigger save data mutation]
    SaveMutation --> ShowResult[Show success or error message]