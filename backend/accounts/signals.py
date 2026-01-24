from django.db.models.signals import post_delete, pre_save
from django.dispatch import receiver
from .models import User

# ... (keep all your existing imports and classes) ...

# 1. DELETE FILE ON OBJECT DELETION
@receiver(post_delete, sender=User)
def submission_delete(sender, instance, **kwargs):
    """
    Deletes the file from filesystem (Docker volume) 
    when the corresponding object is deleted.
    """
    if instance.profile_image:
        # Pass false so FileField doesn't save the model
        instance.profile_image.delete(save=False)

# 2. DELETE OLD FILE ON UPDATE (OPTIONAL BUT RECOMMENDED)
@receiver(pre_save, sender=User)
def submission_update(sender, instance, **kwargs):
    """
    Deletes the old file from filesystem when the `file` field is updated 
    with a new file.
    """
    if not instance.pk:
        return False

    try:
        old_file = User.objects.get(pk=instance.pk).profile_image
    except User.DoesNotExist:
        return False

    # Compare the new file to the old file
    new_file = instance.profile_image
    if not old_file == new_file:
        if old_file:
            old_file.delete(save=False)