# GCAPI

## Objects

### Content
A piece of content represents an image or video.

| Name | Type | Example | Notes |
| ------------- | ------------- | ------------- | ------------- |
| `title`  | String | Hello, world! |
| `fileId`  | String | 943ed0a8-a42a-11e8-98d0-529269fb1459 | UUID Version 1
| `fileType`  | String | .jpg |
| `isImage` | boolean | `true` |
| `tags` | [String] | [alpha, bravo] | 0 or many tags

### Member
A member represents a person in the GC.

| Name | Type | Example | Notes |
| ------------- | ------------- | ------------- | ------------- |
| `firstname`  | String | George |
| `lastname`  | String | Washington |
| `phone`  | String | 8608675309 | Numbers only
| `college` | Object | `true` |
| `college.name` | String | University of Connecticut |
| `college.city` | String | Storrs |
| `college.state` | String | Connecticut |
| `college.color` | String | college_02254B | `college_` prefix followed by hex color code


## Endpoints

### Content
* `GET` `/content`
* `GET` `/content/id/:fileId`
* `GET` `/content/search`
* `POST` `/content/post`


### Members
* `GET` `/members`
* `GET` `/members/id/:memberId`
* `POST` `/members`
