"""altera tamanho smtp_password para 1024

Revision ID: d60a003c99a1
Revises: ce99bb484a6e
Create Date: 2025-07-18 21:22:04.973637

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'd60a003c99a1'
down_revision = 'ce99bb484a6e'
branch_labels = None
depends_on = None


def upgrade():
    op.alter_column('users', 'smtp_password',
        existing_type=sa.String(length=512),
        type_=sa.String(length=1024),
        existing_nullable=False)


def downgrade():
    op.alter_column('users', 'smtp_password',
        existing_type=sa.String(length=1024),
        type_=sa.String(length=512),
        existing_nullable=False)
