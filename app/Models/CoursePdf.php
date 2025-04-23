<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CoursePdf extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'title',
        'course_id',
        'pdf_url',
        'local_path',
        'is_saved',
        'metadata',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'is_saved' => 'boolean',
        'metadata' => 'array',
    ];

    /**
     * Get the user that owns the course PDF.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
