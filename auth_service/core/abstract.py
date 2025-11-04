import uuid
from django.db import models
from django.conf import settings
from django.utils.timezone import now

class ActiveManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(is_active=True, deleted_at__isnull=True)

class AbstractBaseModel(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)

    objects = models.Manager()
    active = ActiveManager()

    class Meta:
        abstract = True

    def soft_delete(self):
        self.is_active = False
        self.deleted_at = now()
        self.save(update_fields=["is_active", "deleted_at"])

    def restore(self):
        self.is_active = True
        self.deleted_at = None
        self.save(update_fields=["is_active", "deleted_at"])

    def hard_delete(self):
        super().delete()
