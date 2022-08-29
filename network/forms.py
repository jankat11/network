
from django import forms

class LoginForm(forms.Form):
    username = forms.CharField(min_length=2, max_length=32, label="", strip=True,
        widget=forms.TextInput(attrs={"placeholder": "Username", "class": "form-control form-group login"}))
    password = forms.CharField(label="", min_length=6, 
        widget=forms.PasswordInput(attrs={"placeholder": "Password", "class": "form-control form-group login"}))

class ChangeForm(forms.Form):
    password = forms.CharField(label="", min_length=6, 
        widget=forms.PasswordInput(attrs={"placeholder": "Current password", "class": "form-control form-group login"}))
    new_password = forms.CharField(label="", min_length=6, 
        widget=forms.PasswordInput(attrs={"placeholder": "New password", "class": "form-control form-group login"}))
    confirm_new_password = forms.CharField(label="", min_length=6, 
        widget=forms.PasswordInput(attrs={"placeholder": "Confirm new password", "class": "form-control form-group login"}))
 

class RegisterForm(forms.Form):
    username = forms.CharField(label="", min_length=2, strip=True, max_length=32, 
        widget=forms.TextInput(attrs={"placeholder": "Username", "class": "form-control form-group login"}))
    email = forms.EmailField(label="",
        widget=forms.EmailInput(attrs={"placeholder": "Email", "class": "form-control form-group login"}))
    password = forms.CharField(label="", min_length=6, 
        widget=forms.PasswordInput(attrs={"placeholder": "Password", "class": "form-control form-group login"}))
    confirmation = forms.CharField(label="", min_length=6,
        widget=forms.PasswordInput(attrs={"placeholder": "Confirm Password", "class": "form-control form-group login"}))


class PostForm(forms.Form):
    new_post = forms.CharField(label="", max_length=1000,
        widget=forms.Textarea(attrs={"placeholder": "What are you thinking?", "class": "form-control newPost shadow-none", "rows": "4"}))


class SearchForm(forms.Form):
    user = forms.CharField(label="", min_length=1, 
        widget=forms.TextInput(attrs={"placeholder": "Search profile", "class": "form-control searchInput searchInputDesktop shadow-none"}))


class SearchFormMobile(forms.Form):
    user = forms.CharField(label="", min_length=1, 
        widget=forms.TextInput(attrs={"placeholder": "Search profile", "class": "form-control searchInput searchInputMobile shadow-none"}))