from django import forms
from .models import Post, Comment, Place


class PlaceForm(forms.ModelForm):
    class Meta:
        model = Place
        fields = ("name", "country")


class PostForm(forms.ModelForm):
    new_place_name = forms.CharField(
        max_length=200,
        required=False,
        widget=forms.TextInput(
            attrs={
                "id": "id_new_place_name",
                "placeholder": "e.g. Eiffel Tower",
            }
        ),
    )
    new_place_country = forms.CharField(
        max_length=100,
        required=False,
        widget=forms.TextInput(
            attrs={
                "id": "id_new_place_country",
                "placeholder": "e.g. France",
            }
        ),
    )

    class Meta:
        model = Post
        fields = ("place", "title", "content", "rating", "photo")
        widgets = {
            "place": forms.HiddenInput(),
            "rating": forms.HiddenInput(),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Allow creating a post with a new place (without selecting existing place).
        self.fields["place"].required = False

    def clean(self):
        cleaned_data = super().clean()
        place = cleaned_data.get("place")
        new_place_name = (cleaned_data.get("new_place_name") or "").strip()
        cleaned_data["new_place_name"] = new_place_name

        if not place and not new_place_name:
            raise forms.ValidationError("Please select or create a place.")

        if not place and new_place_name:
            existing_place = Place.objects.filter(name__iexact=new_place_name).first()
            if existing_place:
                cleaned_data["place"] = existing_place

        return cleaned_data


class CommentForm(forms.ModelForm):
    class Meta:
        model = Comment
        fields = ("text",)
        widgets = {
            "text": forms.Textarea(
                attrs={"rows": 3, "placeholder": "Write a comment..."}
            ),
        }
